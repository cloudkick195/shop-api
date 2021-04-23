import { Controller } from "../decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../decorators/http-method.decorator";
import { Request, Response } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { RequestValidate } from "../utils/validators/request.validate";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { SaleRepository } from "../repositories/sale.repository";
import { RequestHandler } from "../models/request/request.model";
import { createImagePath } from '../utils/transform/image.transform';

@Controller('/sale')
export default class SaleApi {
	public saleTitle: string;

	constructor(
		private saleRepository: SaleRepository
	) {
	}

	@Get('/')
	public async index(request: Request, response: Response) {
		try {
			const params: any = request.query;
			
			const data: Array<any> = await Promise.all([
				this.saleRepository.getListSale(),
			]);
			responseServer(request, response, 200, 'Get list sales successfully',data)
			if (data && data.length > 1) {
				const result: any = this.transformListSales(data[0]);
				return responseServer(request, response, 200, 'Get list sales successfully', {
					data: result,
					count: data[1][0].count
				});
			}
			return responseServer(request, response, 200, 'Get list sales successfully', [])
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Post('/', [AdminAuthenticationMiddleware])
	public async createSale(request: RequestHandler, response: Response) {
		try {
			const data: any = request.body;
			data.created_by = request.user.id;
			const validatesRequest: any = RequestValidate.handle(
				{
					name: ['required'],
					id: ['required'],
					category_id: ['required'],
					price: ['required'],
					sku: ['required']
				}, data
			);
			if (!validatesRequest.success) {
				return raiseException(request, response, 400, 'Validate failure', validatesRequest.errors);
			}
			const sales: any = await this.saleRepository.getSaleById(data.id);
			if (sales && sales.length > 0) {
				return raiseException(request, response, 409, 'Slug is already exist');
			}
			if (data.combinations) {
				data.count = this.getCountAllSaleWhenCreateWithCombinationData(data.combinations);
			}
			const newSale: any = await this.saleRepository.createSale(data, request.user);
			return responseServer(request, response, 201, 'Create sale successfully', newSale);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Delete('/:id', [AdminAuthenticationMiddleware])
	public async removeSale(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			await this.saleRepository.removeSaleBySlug(params.id, request.user);
			return responseServer(request, response, 202, 'Remove sale succesfully');
		} catch (error) {
			return raiseException(request, response, 500, 'Have an error ' + error.message);
		}
	}

	@Get('/:id', [AdminAuthenticationMiddleware])
	public async getSaleBySlug(request: Request, response: Response) {
		try {
			const params = request.params;
			const result: any = await this.saleRepository.getDetailSale(params.id);
			if (result && result[0]) {
				const detailSale: any = this.remapDetailSale(result);
				return responseServer(request, response, 200, "Get info sale successfully", detailSale);
			}
			return responseServer(request, response, 404, 'Sale not found');
		} catch (error) {
			console.log({ error })
			return raiseException(request, response, 500, error.message);
		}
	}

	@Patch('/:id', [AdminAuthenticationMiddleware])
	public async updateSale(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			const data: any = request.body;
			const checkSaleExist: Array<any> = await this.saleRepository.getSaleByKeyValue('id', params.id);
			if (checkSaleExist && checkSaleExist.length > 0) {
				await this.saleRepository.updateDataSale(checkSaleExist[0].sale_id, data, request.user);
				return responseServer(request, response, 200, "Update sale successfully");
			}
			return raiseException(request, response, 404, "Can not found any sale");
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	private transformListSales(data: Array<any>): Array<any> {
		return data.map((item: any) => {
			let sale: any = {
				id: item.id,
				name: item.name,
				price: item.price,
				price_sale: item.price_sale,
				sku: item.sku
			};
			if (item.sale_category_name) {
				sale['category'] = {
					name: item.sale_category_name,
					id: item.sale_category_id
				}
			}
			if (item.pi_key) {
				sale['avatar'] = {
					path: `${process.env.CLOUD_IMAGE_PATH}/${item.pi_path}/v${item.pi_version}/${item.pi_file_name}`,
					key: item.pi_key
				}
			}
			if (item.user_email) {
				sale['user'] = {
					email: item.user_email,
					name: item.user_name
				}
			}

			return sale;
		});
	}

	private getCountAllSaleWhenCreateWithCombinationData(combinationData: Array<any>): number {
		let result: number = 0;
		if (combinationData && combinationData.length > 0) {
			result = combinationData.reduce((source: number, current: any) => {
				if (current.count) {
					return source + current.count;
				}
				return source;
			}, 0);
		}

		return result;
	}

	private remapDetailSale(detailSale: Array<any>): any {
		const result: any = { detail: {}, combinations: [], slides: [] };
		if (detailSale[0]) {
			result['detail'] = {
				id: detailSale[0].sale_id,
				name: detailSale[0].name,
				price: detailSale[0].price,
				price_sale: detailSale[0].price_sale,
				sku: detailSale[0].sku,
				description: detailSale[0].description,
				id_process_image: detailSale[0].id_process_image
			};
			if (detailSale[0].file_name !== '') {
				result['detail']['avatar'] = detailSale[0].file_name ? `${process.env.CLOUD_IMAGE_PATH}/${detailSale[0].path}/v${detailSale[0].version}/${detailSale[0].file_name}` : null;
			}
			if (detailSale[0].cat_id) {
				result['detail']['category'] = {
					id: detailSale[0].cat_id,
					name: detailSale[0].cat_id,
				}
			}
		}
		if (detailSale[1] && detailSale[1].length > 0) {
			const combinationData: any = {};
			detailSale[1].map((item: any) => {
				const dataItem: any = {
					combination_id: item.combination_id,
					count: item.totalCount,
					entity: item.entity_name,
					entity_id: item.entity_id,
					attr_id: item.attr_id
				};
				if (combinationData[item.combination_id]) {
					combinationData[item.combination_id].push(dataItem);
				} else {
					combinationData[item.combination_id] = [dataItem];
				}
			});
			result['combinations'] = Object.keys(combinationData).map((key: any) => combinationData[key]);
		}
		if (detailSale[2] && detailSale[2].length > 0) {
			result['slides'] = detailSale[2].map((item: any) => {
				return {
					slide_id: item.slide_id,
					link: item.link,
					path: item.file_name ? `${process.env.CLOUD_IMAGE_PATH}/${item.path}/v${item.version}/${item.file_name}` : null,
					process_image: item.id_process_image
				}
			});
		}
		if (detailSale && detailSale[3] && detailSale[3] && detailSale[3].length > 0) {
			result['entityImages'] = detailSale[3].map((item: any) => {
				return {
					entity: item.entity_id,
					entity_name: item.entity_name,
					avatar: createImagePath(item),
					process_image: item.process_image,
					id_background: item.id_attribute_entity_background
				}
			});
		}

		return result;
	}
}
