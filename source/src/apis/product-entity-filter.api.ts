import { Controller } from '../decorators/controller.decorator';
import {Delete, Patch, Post} from "../decorators/http-method.decorator";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { Request, Response } from 'express';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { RequestValidate } from "../utils/validators/request.validate";
import { ProductFilterRepository } from "../repositories/product/product-filter.repository";

@Controller('/product-entity-filter')
export class ProductEntityFilterApi {
	constructor(
		private productFilterRepository: ProductFilterRepository
	) {
	}

	@Post('/', [AdminAuthenticationMiddleware])
	public async createProductEntityFilter(request: Request, response: Response) {
		try {
			const data: any = request.body;
			const validateResult: any = RequestValidate.handle({
				entity_name: ['required'],
				attr_id: ['required']
			}, data);
			// check validate result. if true, go to next handle, or no will return exception
			if (validateResult.success) {
				const result: any = await this.productFilterRepository.createProductEntity(data);
				return responseServer(request, response, 201, 'Create product entity filter success', result || {});
			}
			return raiseException(request, response, 400, 'Validate fails', validateResult.errors);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Patch('/:entityId', [AdminAuthenticationMiddleware])
	public async updateProductEntityFilter(request: Request, response: Response) {
		try {
			const data: any = request.body;
			const query_params: any = request.params;
			if (query_params && query_params.entityId) {
				const result: any = await this.productFilterRepository.prepareAndUpdateEntityFilter(query_params.entityId, data);
				return responseServer(request, response, 200, 'Update successfully', result || {});
			}
		} catch (error) {
			return raiseException(request, response, 500, 'Update product entity filter error ' + error.message);
		}
	}

	@Delete('/:entityId', [AdminAuthenticationMiddleware])
	public async removeProductEntityFilter(request: Request, response: Response) {
		try {
			const query_params: any = request.params;
			if (query_params && query_params.entityId) {
				await this.productFilterRepository.prepareAndUpdateEntityFilter(query_params.entityId, { is_archive: true });
				return responseServer(request, response, 200, 'Remove product entity filter successfully');
			}
		} catch (error) {
			return raiseException(request, response, 500, 'Update product entity filter error ' + error.message);
		}
	}
}