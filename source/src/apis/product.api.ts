import { Controller } from "../decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../decorators/http-method.decorator";
import { Request, Response } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { RequestValidate } from "../utils/validators/request.validate";
import { Str } from "../utils/slugable/slug.function";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { ProductRepository } from "../repositories/product/product.repository";
import { ProductCategoryRepository } from "../repositories/product/product-category.repository";
import { RequestHandler } from "../models/request/request.model";
import { createImagePath } from '../utils/transform/image.transform';
import { CustomerRepository } from "../repositories/customer.repository";
import { ProductCombinationRepository } from "../repositories/product/product-combination.repository";
import axios from 'axios';
import qs from 'qs'
@Controller('/product')
export default class ProductApi {
	public productTitle: string;

	constructor(
		private productRepository: ProductRepository,
		private productCategoryRepository: ProductCategoryRepository,
		private readonly customerRepository: CustomerRepository,
		private readonly productCombinationRepository: ProductCombinationRepository
	) {
	}

	@Get('/', [AuthenticationMiddleware])
	public async index(request: Request, response: Response) {
		try {
			const params: any = request.query;
			const data: Array<any> = await Promise.all([
				this.productRepository.getListProducts(params),
				this.productRepository.getListProducts(params, true)
			]);
			if (data && data.length > 1) {
				const result: any = this.transformListProducts(data[0]);
				return responseServer(request, response, 200, 'Get list products successfully', {
					data: result,
					count: data[1][0].count
				});
			}
			return responseServer(request, response, 200, 'Get list products successfully', [])
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Post('/', [AdminAuthenticationMiddleware])
	public async createProduct(request: RequestHandler, response: Response) {
		try {
			const data: any = request.body;
			if (!data.slug && data.name) {
				data.slug = Str.slug(data.name);
			}
			data.created_by = request.user.id;
			const validatesRequest: any = RequestValidate.handle(
				{
					name: ['required'],
					slug: ['required'],
					category_id: ['required'],
					price: ['required'],
					sku: ['required']
				}, data
			);
			if (!validatesRequest.success) {
				return raiseException(request, response, 400, 'Validate failure', validatesRequest.errors);
			}
			const products: any = await this.productRepository.getProductBySlug(data.slug);
			if (products && products.length > 0) {
				return raiseException(request, response, 409, 'Slug is already exist');
			}
			if (data.combinations) {
				data.count = this.getCountAllProductWhenCreateWithCombinationData(data.combinations);
			}
			const newProduct: any = await this.productRepository.createProduct(data, request.user);
			return responseServer(request, response, 201, 'Create product successfully', newProduct);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Post('/webhook', [])
	public async connectWebhook(request: RequestHandler, response: Response) {
		try {
			const data: any = request.body;
			// console.log(data);
			const dataFromWebhook: any = data.Notifications[0].Data[0];
			console.log('***** dataFromWebhook ****** ', dataFromWebhook);
			// check update product from Kiotviet
			if(data.Notifications[0].Action === `product.update.${process.env.RETAILER_ID}`) {
				const skuCode: string = dataFromWebhook.Code;
				const checkProductExist: Array<any> = await this.productRepository.getProductByKeyValue('sku', skuCode);
				const checkConbinationSkuExistProductKiotviet = await this.productCombinationRepository.checkExistCombinationBySku(skuCode);

				// Update count of products in table product_attribute_combinations
				if(checkConbinationSkuExistProductKiotviet) {
					await this.productCombinationRepository.updateCount(skuCode, dataFromWebhook.Inventories[0].OnHand);
				}

				// If find the product by sku then update product
				if (checkProductExist && checkProductExist.length > 0) {
					const updateData: any = {
						name: dataFromWebhook.Name,
						price: dataFromWebhook.BasePrice,
						description: dataFromWebhook.Description
					}
					await this.productRepository.updateDataProduct(checkProductExist[0].product_id, updateData, request.user);
					return responseServer(request, response, 200, "Update product successfully");
				} else {
					// If not find the product by sku then create new product
					const newProductData: any = {
						name: dataFromWebhook.Name,
						price: dataFromWebhook.BasePrice,
						description: dataFromWebhook.Description
					}
					const category: any = await this.productCategoryRepository.findProductCategoryByKey(dataFromWebhook.CategoryName, 'name');
					if(category) {
						newProductData.category_id = category.id
					}
					if (dataFromWebhook.Name) {
						newProductData.slug = Str.slug(dataFromWebhook.Name);
					}

					const products: any = await this.productRepository.getProductBySlug(newProductData.slug);
					if (products && products.length > 0) {
						return raiseException(request, response, 409, 'Slug is already exist');
					}
					if (newProductData.combinations) {
						newProductData.count = this.getCountAllProductWhenCreateWithCombinationData(newProductData.combinations);
					}
					const newProduct: any = await this.productRepository.createProduct(newProductData, request.user);
					return responseServer(request, response, 201, 'Create product successfully', newProduct);
				}
			}  
			
			// Check delete product from Kiotviet
			if (data.Notifications[0].Action === `product.delete.${process.env.RETAILER_ID}`) {
				console.log(`Remove product has id: ${data.Notifications[0].Data[0]} from Kiotviet`)
				
				return responseServer(request, response, 200, `Remove product has id ${data.Notifications[0].Data[0]} from Kiotviet successfully`);
			} 
			
			// Check create/update customer from Kiotviet
			if (data.Notifications[0].Action === `customer.update.${process.env.RETAILER_ID}`) {
				
				return responseServer(request, response, 200, `Create customer from Kiotviet successfully`);
			} 

			// Check create/update order from Kiotviet
			if (data.Notifications[0].Action === `order.update.${process.env.RETAILER_ID}`) {
				console.log('run here')

				const listProductOrder: any = dataFromWebhook.OrderDetails;
				const listPromise:any = [];
				listProductOrder.forEach((product: any) => {
					listPromise.push(this.getProductKiotviet(product.ProductCode))
				});

				const listProducts: any = await Promise.all(listPromise)
				console.log('========== listProducts: ', listProducts)
				for ( const prod of listProducts ) {
					await this.productCombinationRepository.checkExistCombinationBySku(prod.code);
				}
				
				return responseServer(request, response, 200, `Create/Update order from Kiotviet successfully`);
			} 
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Delete('/:slug', [AdminAuthenticationMiddleware])
	public async removeProduct(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			await this.productRepository.removeProductBySlug(params.slug, request.user);
			return responseServer(request, response, 202, 'Remove product succesfully');
		} catch (error) {
			return raiseException(request, response, 500, 'Have an error ' + error.message);
		}
	}

	@Get('/:slug', [AdminAuthenticationMiddleware])
	public async getProductBySlug(request: Request, response: Response) {
		try {
			const params = request.params;
			const result: any = await this.productRepository.getDetailProduct(params.slug);
			if (result && result[0]) {
				const detailProduct: any = this.remapDetailProduct(result);
				return responseServer(request, response, 200, "Get info product successfully", detailProduct);
			}
			return responseServer(request, response, 404, 'Product not found');
		} catch (error) {
			console.log({ error })
			return raiseException(request, response, 500, error.message);
		}
	}

	@Patch('/:slug', [AdminAuthenticationMiddleware])
	public async updateProduct(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			const data: any = request.body;
			const checkProductExist: Array<any> = await this.productRepository.getProductByKeyValue('slug', params.slug);
			if (checkProductExist && checkProductExist.length > 0) {
				await this.productRepository.updateDataProduct(checkProductExist[0].product_id, data, request.user);
				return responseServer(request, response, 200, "Update product successfully");
			}
			return raiseException(request, response, 404, "Can not found any product");
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	private transformListProducts(data: Array<any>): Array<any> {
		return data.map((item: any) => {
			let product: any = {
				id: item.id,
				name: item.name,
				slug: item.slug,
				price: item.price,
				price_sale: item.price_sale,
				sku: item.sku
			};
			if (item.product_category_name) {
				product['category'] = {
					name: item.product_category_name,
					slug: item.product_category_slug
				}
			}
			if (item.pi_key) {
				product['avatar'] = {
					path: `${process.env.CLOUD_IMAGE_PATH}/${item.pi_path}/v${item.pi_version}/${item.pi_file_name}`,
					key: item.pi_key
				}
			}
			if (item.user_email) {
				product['user'] = {
					email: item.user_email,
					name: item.user_name
				}
			}

			return product;
		});
	}

	private getCountAllProductWhenCreateWithCombinationData(combinationData: Array<any>): number {
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

	private remapDetailProduct(detailProduct: Array<any>): any {
		const result: any = { detail: {}, combinations: [], slides: [] };
		if (detailProduct[0]) {
			result['detail'] = {
				id: detailProduct[0].product_id,
				name: detailProduct[0].name,
				slug: detailProduct[0].slug,
				price: detailProduct[0].price,
				price_sale: detailProduct[0].price_sale,
				sku: detailProduct[0].sku,
				description: detailProduct[0].description,
				id_process_image: detailProduct[0].id_process_image
			};
			if (detailProduct[0].file_name !== '') {
				result['detail']['avatar'] = detailProduct[0].file_name ? `${process.env.CLOUD_IMAGE_PATH}/${detailProduct[0].path}/v${detailProduct[0].version}/${detailProduct[0].file_name}` : null;
			}
			if (detailProduct[0].cat_id) {
				result['detail']['category'] = {
					id: detailProduct[0].cat_id,
					name: detailProduct[0].cat_slug,
					slug: detailProduct[0].cat_slug
				}
			}
		}
		if (detailProduct[1] && detailProduct[1].length > 0) {
			const combinationData: any = {};
			detailProduct[1].map((item: any) => {
				const dataItem: any = {
					combination_id: item.combination_id,
					combination_sku: item.combination_sku,
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
		if (detailProduct[2] && detailProduct[2].length > 0) {
			result['slides'] = detailProduct[2].map((item: any) => {
				return {
					slide_id: item.slide_id,
					link: item.link,
					path: item.file_name ? `${process.env.CLOUD_IMAGE_PATH}/${item.path}/v${item.version}/${item.file_name}` : null,
					process_image: item.id_process_image
				}
			});
		}
		if (detailProduct && detailProduct[3] && detailProduct[3] && detailProduct[3].length > 0) {
			result['entityImages'] = detailProduct[3].map((item: any) => {
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

	private async checkEmailExist(email: string): Promise<boolean> {
    const result: any = await this.customerRepository.findCustomerByEmail(email);
    if (result && result.length > 0) {
      return true;
    }

    return false;
  }

	private async getProductKiotviet(code: string): Promise<any> {
		console.log('get code: ', code)
		const data: any = {
			"client_id": process.env.CLIENT_ID,
			"client_secret": process.env.CLIENT_SECRET,
			"grant_type": process.env.GRANT_TYPE,
			"scopes": process.env.SCOPES,
		}

		const res: any = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		console.log('token: ', res.data.access_token)
    const product: any = await axios.get(`${process.env.KIOTVIET_PUBLIC_API}/products/code/${code}`, {
      headers: {
          'Authorization': `Bearer ${res.data.access_token}`,
          'Retailer': process.env.RETAIL_NAME
      }
    })
    
    return product.data
  }
}
