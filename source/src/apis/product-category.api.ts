import { Controller } from "../decorators/controller.decorator";
import { Post, Get, Patch, Delete } from "../decorators/http-method.decorator";
import { Request, Response } from "express";
import { ProductCategoryRepository } from "../repositories/product/product-category.repository";
import { RequestValidate, RequestValidateResult } from "../utils/validators/request.validate";
import { Str } from "../utils/slugable/slug.function";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { RequestHandler } from "../models/request/request.model";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { SortProductCategoryInputApiModel } from '../models/product-category/input/sort-product-category.input-api.model';
import { RedisClientFacade } from "../cache/redis.client";

@Controller('/product-category')
export class ProductCategoryApi {
	constructor(
    private productCategoryRepository: ProductCategoryRepository,
    private redisCache: RedisClientFacade
    ) { }

	@Post('/', [AuthenticationMiddleware])
  public async createProductCategory(request: RequestHandler, response: Response) {
    try {
      const data: any = request.body;
      if (!data.slug) {
        data.slug = data.name ? Str.slug(data.name) : '';
      }
      const validates: RequestValidateResult = RequestValidate.handle({
        name: ['required'],
        slug: ['required']
      }, data);
      data.created_by = request.user.id;
      if (!validates.success) {
        return raiseException(request, response, 400, 'Validate fails', validates.errors)
      }
      const result: any = await this.productCategoryRepository.storeProductCategory(data);
      let resultJson: any = {};
      if (result && result.id) {
        resultJson = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id,
          is_archive: !!result.is_archive,
          is_show_in_home: !!result.is_show_in_home,
        };
        const checkExistInCache: any = await this.getProductCategorysCacheData();
        if (!checkExistInCache) {
          await this.setProductCategoryCache([resultJson]);
        } else {
          checkExistInCache.push(resultJson);
          await this.setProductCategoryCache(JSON.stringify(checkExistInCache));
        }
      }
      return responseServer(request, response, 201, 'Create Shop successfully', resultJson);
    } catch (error) {
      return raiseException(request, response, 500, 'Validate fails', error.message)
    } 
  }

  @Get('/parent', [AuthenticationMiddleware])
  public async getListParentProductCategory(request: Request, response: Response) {
    try {

    } catch (error) {
      return raiseException(request, response, 500, 'Get list fail ' + error.message,);
    }
  }

  @Patch('/sort', [AuthenticationMiddleware])
  public async sortProductCategory(request: RequestHandler, response: Response) {
    try {
      const data: any = request.body;
      const validates: any = RequestValidate.handle({
        pc_id: ['required'],
        current_index: ['required']
      }, data);
      if (validates.success) {
        const dataItem: SortProductCategoryInputApiModel = {
          pc_id: data.pc_id,
          current_index: data.current_index
        };
        await this.productCategoryRepository.sortProductCategories(dataItem);
        const categories = await this.productCategoryRepository.getListProductCategories({});
        const cacheData: Array<any> = await this.getProductCategorysCacheData();
        let result: Array<any> = [];
        if (cacheData && cacheData.length > 0) {
          result = this.transformListProductCategory(categories);
          this.setProductCategoryCache(JSON.stringify(result));
        }
        return responseServer(request, response, 200, "Sort ok");
      }
      return raiseException(request, response, 404, 'Can not find any sort data');
    } catch(error) {
      return raiseException(request, response, 500, 'Sort fails ' + error.message,);
    }
  }

  @Patch('/:slug', [AuthenticationMiddleware])
  public async updateProductCategory(request: RequestHandler, response: Response) {
    try {
      const data: any = request.body;
      const queries: any = request.params;
      data.updated_by = request.user.id;
      if (data.name && !data.slug) {
        data.slug = Str.slug(data.name);
      }
      const category: any = await this.productCategoryRepository.findProductCategoryByKey(queries.slug, 'slug');
      if (!category || !category.id) {
        return responseServer(request, response, 404, 'Can not found any product category');
      }
      let resultJson: any = {};
      await this.productCategoryRepository.updateProductCategory(category.id, data);
      const result = await this.productCategoryRepository.findProductCategoryByKey(category.id, 'product_category_id', false)
      if (result) {
        let cacheData: Array<any> = await this.getProductCategorysCacheData();
        const indexCurrentProductCategoryInCache: number = cacheData.findIndex((item: any) => item.slug == queries.slug);
        resultJson = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id,
          is_archive: !!result.is_archive,
          is_show_in_home: !!result.is_show_in_home,
        };
        cacheData[indexCurrentProductCategoryInCache] = { ...cacheData[indexCurrentProductCategoryInCache], ...resultJson};
        this.setProductCategoryCache(JSON.stringify(cacheData));
      }
      return responseServer(request, response, 200, 'Update product category successfully', resultJson);
    } catch (error) {
      return raiseException(request, response, 500, 'Update fails', error.message)
    } 
  }

  @Get('/', [AuthenticationMiddleware])
  public async getListProductCategories(request: Request, response: Response) {
    try {
      const params: any = request.query;
      const cacheData: Array<any> = await this.getProductCategorysCacheData();
      let result: Array<any> = [];
      if (cacheData && cacheData.length > 0) {
        result = cacheData;
      } else {
        const data: Array<any> = await this.productCategoryRepository.getListProductCategories(params);
        result = this.transformListProductCategory(data);
        this.setProductCategoryCache(JSON.stringify(result));
      }
      return responseServer(request, response, 200, 'Get list product categories successfully', result);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private transformListProductCategory(data: any): any {
    const dataItemNoParent: Array<any> = [];
    let dataItem: any = {};
    data.map((item: any) => {
      const itemInstance: any = {
        id: item.id,
        name: item.name,
        slug: item.slug,
        parent_id: item.parent_id,
        is_archive: !!item.is_archive,
        is_show_in_home: !!item.is_show_in_home,
        user: {
          name: item.user_name,
          email: item.user_email,
          id: item.user_id
        },
        child: []
      };
      if (itemInstance.parent_id === 0) {
        dataItemNoParent.push(itemInstance);
      }
      if (dataItem[itemInstance.parent_id]) {
        dataItem[itemInstance.parent_id].push(itemInstance);
      } else {
        dataItem[itemInstance.parent_id] = [itemInstance];
      }
      if (!dataItem[itemInstance.id]) {
        dataItem[itemInstance.id] = [];
      }
      itemInstance.child = dataItem[itemInstance.id];
    });
    return dataItemNoParent;
  }

  @Get('/:slug', [AuthenticationMiddleware])
  public async findProductCategoryBySlug(request: Request, response: Response) {
    try {
      const queries: any = request.params;
      const result = await this.productCategoryRepository.findProductCategoryByKey(queries.slug, 'slug', true);
      if (result) {
        const resultJson: {[key: string]: any} = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id,
          is_archive: !!result.is_archive,
          is_show_in_home: !!result.is_show_in_home,
          avatar: result.path ? `${ process.env.CLOUD_IMAGE_PATH }/${ result.path }/v${ result.version }/${ result.file_name }`: null,
          id_process_image: result.id_process_image
        };
        return responseServer(request, response, 200, 'Get product category successfully', resultJson);
      }
      return raiseException(request, response, 404, `Can not find any data for slug ${ queries.slug }`);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Delete('/:slug', [AuthenticationMiddleware])
  public async removeProductCategoryBySlug(request: RequestHandler, response: Response) {
    try {
      const queries: any = request.params;
      await this.productCategoryRepository.removeProductCategory(queries.slug, request.user.id);
      let dataInCache: Array<any> = await this.getProductCategorysCacheData();
      if (dataInCache && dataInCache.length > 0) {
        dataInCache = dataInCache.filter((item: any) => item.slug != queries.slug);
        this.setProductCategoryCache(JSON.stringify(dataInCache));
      }
      return responseServer(request, response, 200, 'Remove successfully');
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private async getProductCategorysCacheData(): Promise<Array<any>> {
    const dataInCache: string = await this.redisCache.getKey('productCategory');
    if (dataInCache) return JSON.parse(dataInCache);
    return [];
  }

  private async setProductCategoryCache(data: any): Promise<void> {
    this.redisCache.setKey('productCategory', data);
  }
}
