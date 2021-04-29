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
			
			if (data && data.length > 0) {
				const result: any = this.transformListSales(data[0]);
				
				return responseServer(request, response, 200, 'Get list sales successfully', {
					data: result,
					count: data[0].count
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
					type: ['required'],
					type_select: ['required'],
					value: ['required'],
				}, data
			);
			
			data.category_select = JSON.stringify(data.category_select);
			data.product_select = data.product_select;
			if (!validatesRequest.success) {
				return raiseException(request, response, 400, 'Validate failure', validatesRequest.errors);
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
			await this.saleRepository.removeSaleById(params.id);
			return responseServer(request, response, 202, 'Remove sale succesfully');
		} catch (error) {
			return raiseException(request, response, 500, 'Have an error ' + error.message);
		}
	}

	@Get('/:id', [AdminAuthenticationMiddleware])
	public async getSaleById(request: Request, response: Response) {
		try {
			const params = request.params;
			const result: any = await this.saleRepository.getDetailSale(params.id);
			if (result && result[0]) {
				const detailSale: any = this.remapDetailSale(result);
				return responseServer(request, response, 200, "Get info sale successfully", detailSale);
			}
			return responseServer(request, response, 404, 'Sale not found');
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Patch('/:id', [AdminAuthenticationMiddleware])
	public async updateSale(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			const data: any = request.body;
			
			
			const checkSaleExist: Array<any> = await this.saleRepository.getSaleByKeyValue('sale_id', params.id);
			
			if (checkSaleExist && checkSaleExist.length > 0) {
				if(data.category_select){
					data.category_select = JSON.stringify(data.category_select);
				}
				if(data.product_select){
					//data.product_select = JSON.stringify(data.product_select);
					data.product_select = data.product_select;
				}
				await this.saleRepository.updateDataSale(checkSaleExist[0].id, data, request.user);
				return responseServer(request, response, 200, "Update sale successfully");
			}
			return raiseException(request, response, 404, "Can not found any sale");
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	private transformListSales(data: Array<any>): Array<any> {
	
		
		return data.map((item: any) => {
			return {
				id: item.sale_id,
				name: item.name,
				description: item.description,
				type: item.type,
				type_select: item.type_select,
				category_select: item.category_select,
				product_select: item.product_select,
				status: item.status,
				value: item.value,
			};
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
				type: detailSale[0].type,
				type_select: detailSale[0].type_select,
				category_select: JSON.parse(detailSale[0].category_select),
				product_select:  JSON.parse(detailSale[0].product_select),
				description: detailSale[0].description,
				status: detailSale[0].status,
				value: detailSale[0].value
			};
			
		}


		return result;
	}
}
