import { Controller } from "../decorators/controller.decorator";
import { Post, Get, Patch, Delete } from "../decorators/http-method.decorator";
import { Request, Response } from "express";
import { PostCategoryRepository } from "../repositories/post/post-category.repository";
import { RequestValidate, RequestValidateResult } from "../utils/validators/request.validate";
import { Str } from "../utils/slugable/slug.function";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { RequestHandler } from "../models/request/request.model";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { SortPostCategoryInputApiModel } from '../models/post-category/input/sort-post-category.input-api.model';
import { RedisClientFacade } from "../cache/redis.client";

@Controller('/post-category')
export class PostCategoryApi {
	constructor(
    private postCategoryRepository: PostCategoryRepository,
    private redisCache: RedisClientFacade
    ) { }

	@Post('/', [AuthenticationMiddleware])
  public async createPostCategory(request: RequestHandler, response: Response) {
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
      const result: any = await this.postCategoryRepository.storePostCategory(data);
      let resultJson: any = {};
      if (result && result.id) {
        resultJson = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id
        };
        const checkExistInCache: any = await this.getPostCategorysCacheData();
        if (!checkExistInCache) {
          await this.setPostCategoryCache([resultJson]);
        } else {
          
          if(resultJson.parent_id){
            checkExistInCache.map((item: any) => {
              if(item.id == resultJson.parent_id){
                item.child.push(resultJson);
              }
              return item
            });
          }else{
            checkExistInCache.push(resultJson);
          }
          await this.setPostCategoryCache(JSON.stringify(checkExistInCache));
        }
      }
      return responseServer(request, response, 201, 'Create Shop successfully', resultJson);
    } catch (error) {
      console.log(error);
      
      return raiseException(request, response, 500, 'Validate fails', error.message)
    } 
  }

  @Get('/parent', [AuthenticationMiddleware])
  public async getListParentPostCategory(request: Request, response: Response) {
    try {

    } catch (error) {
      return raiseException(request, response, 500, 'Get list fail ' + error.message,);
    }
  }

  @Patch('/sort', [AuthenticationMiddleware])
  public async sortPostCategory(request: RequestHandler, response: Response) {
    try {
    
      
      const data: any = request.body;
      const validates: any = RequestValidate.handle({
        pc_id: ['required'],
        current_index: ['required']
      }, data);
      if (validates.success) {
        const dataItem: SortPostCategoryInputApiModel = {
          pc_id: data.pc_id,
          current_index: data.current_index
        };
        await this.postCategoryRepository.sortPostCategories(dataItem);
        const categories = await this.postCategoryRepository.getListPostCategories({});
        const cacheData: Array<any> = await this.getPostCategorysCacheData();
        let result: Array<any> = [];
        if (cacheData && cacheData.length > 0) {
          result = this.transformListPostCategory(categories);
          this.setPostCategoryCache(JSON.stringify(result));
        }
        return responseServer(request, response, 200, "Sort ok");
      }
      return raiseException(request, response, 404, 'Can not find any sort data');
    } catch(error) {
      return raiseException(request, response, 500, 'Sort fails ' + error.message,);
    }
  }

  @Patch('/:slug', [AuthenticationMiddleware])
  public async updatePostCategory(request: RequestHandler, response: Response) {
    try {
      const data: any = request.body;
      const queries: any = request.params;
      data.updated_by = request.user.id;
      if (data.name && !data.slug) {
        data.slug = Str.slug(data.name);
      }
      const category: any = await this.postCategoryRepository.findPostCategoryByKey(queries.slug, 'slug');
      if (!category || !category.id) {
        return responseServer(request, response, 404, 'Can not found any post category');
      }
      let resultJson: any = {};
      await this.postCategoryRepository.updatePostCategory(category.id, data);
      const result = await this.postCategoryRepository.findPostCategoryByKey(category.id, 'post_category_id', false)
      if (result) {
        let cacheData: Array<any> = await this.getPostCategorysCacheData();
        const indexCurrentPostCategoryInCache: number = cacheData.findIndex((item: any) => item.slug == queries.slug);
        resultJson = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id
        };
        cacheData[indexCurrentPostCategoryInCache] = { ...cacheData[indexCurrentPostCategoryInCache], ...resultJson};
        this.setPostCategoryCache(JSON.stringify(cacheData));
      }
      return responseServer(request, response, 200, 'Update post category successfully', resultJson);
    } catch (error) {
      return raiseException(request, response, 500, 'Update fails', error.message)
    } 
  }

  @Get('/', [AuthenticationMiddleware])
  public async getListPostCategories(request: Request, response: Response) {
    try {
      const params: any = request.query;
      const cacheData: Array<any> = await this.getPostCategorysCacheData();
      let result: Array<any> = [];
      
      if (cacheData && cacheData.length > 0) {
        result = cacheData;
      } else {
        const data: Array<any> = await this.postCategoryRepository.getListPostCategories(params);
        result = this.transformListPostCategory(data);
        this.setPostCategoryCache(JSON.stringify(result));
      }
      return responseServer(request, response, 200, 'Get list post categories successfully', result);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private transformListPostCategory(data: any): any {
    const dataItemNoParent: Array<any> = [];
    let dataItem: any = {};
    data.map((item: any) => {
      const itemInstance: any = {
        id: item.id,
        name: item.name,
        slug: item.slug,
        parent_id: item.parent_id,
     
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
  public async findPostCategoryBySlug(request: Request, response: Response) {
    try {
      const queries: any = request.params;
      const result = await this.postCategoryRepository.findPostCategoryByKey(queries.slug, 'slug', true);
      if (result) {
        const resultJson: {[key: string]: any} = {
          id: result.id,
          name: result.name,
          slug: result.slug,
          parent_id: result.parent_id,
       
          is_show_in_home: !!result.is_show_in_home,
          avatar: result.path ? `${ process.env.CLOUD_IMAGE_PATH }/${ result.path }/v${ result.version }/${ result.file_name }`: null,
          id_process_image: result.id_process_image
        };
        return responseServer(request, response, 200, 'Get post category successfully', resultJson);
      }
      return raiseException(request, response, 404, `Can not find any data for slug ${ queries.slug }`);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Delete('/:slug', [AuthenticationMiddleware])
  public async removePostCategoryBySlug(request: RequestHandler, response: Response) {
    try {
      const queries: any = request.params;
      await this.postCategoryRepository.removePostCategory(queries.slug, request.user.id);
      let dataInCache: Array<any> = await this.getPostCategorysCacheData();
      if (dataInCache && dataInCache.length > 0) {
        dataInCache = dataInCache.filter((item: any) => {
          if (item.child && item.child.length > 0) {
            item.child = item.child.filter((itemChild: any)=>{
              return itemChild.slug != queries.slug
            });

          }
         
          
          return item.slug != queries.slug
         
        });
      
        
        this.setPostCategoryCache(JSON.stringify(dataInCache));
      }
      return responseServer(request, response, 200, 'Remove successfully');
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private async getPostCategorysCacheData(): Promise<Array<any>> {
    const dataInCache: string = await this.redisCache.getKey('postCategory');
    if (dataInCache) return JSON.parse(dataInCache);
    return [];
  }

  private async setPostCategoryCache(data: any): Promise<void> {
    this.redisCache.setKey('postCategory', data);
  }
}
