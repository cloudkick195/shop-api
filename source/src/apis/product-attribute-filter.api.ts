import { Controller } from "../decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../decorators/http-method.decorator";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { Request, Response } from "express";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { ProductAttributeFilterRepository } from "../repositories/product/product-attribute-filter.repository";
import { RequestValidate } from "../utils/validators/request.validate";

@Controller('/product-attribute-filter')
export class ProductAttributeFilterApi {
  constructor(
    private productAttributeFilterRepository: ProductAttributeFilterRepository
  ) {
  }

  @Get('/', [AdminAuthenticationMiddleware])
  public async getProductFilter(request: Request, response: Response) {
    try {
      const result: Array<any> = await this.productAttributeFilterRepository.getListProductFilter();
      const data: any = this.remapListProductFilterToResponse(result);
      return responseServer(request, response, 200, 'Get list filters success', data);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private remapListProductFilterToResponse(data: any): Array<any> {
    let result: any = {};
    data.map((item: any) => {
      if (result[item.attribute_id]) {
        result[item.attribute_id].entities.push(item);
      } else {
        result[item.attribute_id] = {
          attribute_name: item.attribute_name,
          attribute_id: item.attribute_id,
          have_entity_avatar: item.have_entity_avatar,
          entities: item.entity_id ? [item] : []
        };
      }
    });
    return Object.keys(result).map((item: any) => {
      return result[item];
    });
  }

  @Patch('/:attributeId', [AdminAuthenticationMiddleware])
  public async updateProductAttributeFilter(request: Request, response: Response) {
    try {
      const data: any = request.body;
      const query_params: any = request.params;
      if (query_params && query_params.attributeId) {
        const result: any = await this.productAttributeFilterRepository.prepareAndUpdateProductAttributeFilter(query_params.attributeId, data);
        return responseServer(request, response, 200, 'Update product attribute filter successfully ', result);
      }
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Post('/', [AdminAuthenticationMiddleware])
  public async createProductAttributeFilter(request: Request, response: Response) {
    try {
      const data: any = request.body;
      const validateResult: any = RequestValidate.handle({
        attribute_name: ['required']
      }, data);
      // check validate result. if true, go to next handle, or no will return exception
      if (validateResult.success) {
        const result: any = await this.productAttributeFilterRepository.createProductAttributeFilter(data);
        return responseServer(request, response, 201, 'Create product attribute filter success', { ...result, entities: [] } || {});
      }
      return raiseException(request, response, 400, 'Validate fails', validateResult.errors);
    } catch (error) {
      return raiseException(request, response, 500, 'Error when create attribute filter ' + error.message);
    }
  }

  @Delete('/:attributeId', [AdminAuthenticationMiddleware])
  public async removeProductAttributeFilter(request: Request, response: Response) {
    try {
      const query_params: any = request.params;
      if (query_params && query_params.attributeId) {
        await this.productAttributeFilterRepository.prepareAndUpdateProductAttributeFilter(
          query_params.attributeId,
          { is_archive: true }
        );
        return responseServer(request, response, 200, 'Remove product attribute filter successfully ');
      }
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }
}