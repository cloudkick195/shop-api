import { Controller } from "../decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../decorators/http-method.decorator";
import { Request, Response } from "express";
import { AuthenticationMiddleware } from "../middlewares/authentication.middleware";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { RequestValidate } from "../utils/validators/request.validate";
import { Str } from "../utils/slugable/slug.function";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { PostRepository } from "../repositories/post/post.repository";
import { PostCategoryRepository } from "../repositories/post/post-category.repository";
import { RequestHandler } from "../models/request/request.model";
import { createImagePath } from '../utils/transform/image.transform';
import { CustomerRepository } from "../repositories/customer.repository";


@Controller('/post')
export default class PostApi {
	public postTitle: string;

	constructor(
		private postRepository: PostRepository,
		private postCategoryRepository: PostCategoryRepository,
		private readonly customerRepository: CustomerRepository,
	) {
	}

	@Get('/', [AuthenticationMiddleware])
	public async index(request: Request, response: Response) {
		try {
			const params: any = request.query;
			const data: Array<any> = await Promise.all([
				this.postRepository.getListPosts(params),
				this.postRepository.getListPosts(params, true)
			]);
			if (data && data.length > 1) {
				const result: any = this.transformListPosts(data[0]);
				return responseServer(request, response, 200, 'Get list posts successfully', {
					data: result,
					count: data[1][0].count
				});
			}
			return responseServer(request, response, 200, 'Get list posts successfully', [])
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Post('/', [AdminAuthenticationMiddleware])
	public async createPost(request: RequestHandler, response: Response) {
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
					category_id: ['required']
				}, data
			);
			
			
			if (!validatesRequest.success) {
				return raiseException(request, response, 400, 'Validate failure', validatesRequest.errors);
			}
			const posts: any = await this.postRepository.getPostBySlug(data.slug);
			
			if (posts && (posts.length > 0 || posts.id)) {
				return raiseException(request, response, 409, 'Slug is already exist');
			}
			if (data.combinations) {
				data.count = this.getCountAllPostWhenCreateWithCombinationData(data.combinations);
			}
			const newPost: any = await this.postRepository.createPost(data, request.user);
			return responseServer(request, response, 201, 'Create post successfully', newPost);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	// @Delete('/:slug', [AdminAuthenticationMiddleware])
	// public async removePost(request: RequestHandler, response: Response) {
	// 	try {
	// 		const params: any = request.params;
			
	// 		await this.postRepository.removePostBySlug(params.slug, request.user);
	// 		return responseServer(request, response, 202, 'Remove post succesfully');
	// 	} catch (error) {
	// 		return raiseException(request, response, 500, 'Have an error ' + error.message);
	// 	}
	// }
	@Delete('/:id', [AdminAuthenticationMiddleware])
	public async removePost(request: RequestHandler, response: Response) {
		try {

			const params: any = request.params;
			
			await this.postRepository.removePostById(params.id);
			
			return responseServer(request, response, 202, 'Remove post succesfully');
		} catch (error) {
			return raiseException(request, response, 500, 'Have an error ' + error.message);
		}
	}

	// @Get('/:slug', [AdminAuthenticationMiddleware])
	// public async getPostBySlug(request: Request, response: Response) {
	// 	try {
	// 		const params = request.params;
	// 		const result: any = await this.postRepository.getDetailPost(params.slug);
	// 		if (result && result[0]) {
	// 			const detailPost: any = this.remapDetailPost(result);
	// 			return responseServer(request, response, 200, "Get info post successfully", detailPost);
	// 		}
	// 		return responseServer(request, response, 404, 'Post not found');
	// 	} catch (error) {
	// 		console.log({ error })
	// 		return raiseException(request, response, 500, error.message);
	// 	}
	// }

	
	@Get('/:id', [AdminAuthenticationMiddleware])
	public async getPostById(request: Request, response: Response) {
		try {
			const params = request.params;
			const result: any = await this.postRepository.getDetailPost(params.id);
			if (result && result[0]) {
				const detailPost: any = this.remapDetailPost(result);
				return responseServer(request, response, 200, "Get info post successfully", detailPost);
			}
			return responseServer(request, response, 404, 'Post not found');
		} catch (error) {
			console.log({ error })
			return raiseException(request, response, 500, error.message);
		}
	}

	@Patch('/:id', [AdminAuthenticationMiddleware])
	public async updatePost(request: RequestHandler, response: Response) {
		try {
			const params: any = request.params;
			const data: any = request.body;
			const listQuery:any = [
				this.postRepository.getPostByKeyValue('post_id', params.id),
			]
			
			if(data.slug !== undefined){
				listQuery.push(this.postRepository.getPostByKeyValue('slug', data.slug));
			}
			let messObject:any = {
				code: "200",
				mess: "Update post successfully"
			};
			const results: any = await Promise.all(listQuery);
			console.log(2,data.slug,results[1]);
			
			if(results[1] && (results[1].length > 0 || results[1].id)){
				return raiseException(request, response, 200, "slug_exist");
			}
		
			
			const checkPostExist: Array<any> = results[0];
			if (checkPostExist && checkPostExist.length > 0) {
				await this.postRepository.updateDataPost(checkPostExist[0].post_id, data, request.user);
				return responseServer(request, response, messObject.code, messObject.mess);
			}
			return raiseException(request, response, 404, "Can not found any post");
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	private transformListPosts(data: Array<any>): Array<any> {
		return data.map((item: any) => {
			let post: any = {
				id: item.id,
				name: item.name,
				slug: item.slug,
				price: item.price,
				price_sale: item.price_sale,
				sku: item.sku
			};
			if (item.post_category_name) {
				post['category'] = {
					name: item.post_category_name,
					slug: item.post_category_slug
				}
			}
			if (item.pi_key) {
				post['avatar'] = {
					path: `${process.env.CLOUD_IMAGE_PATH}/${item.pi_path}/v${item.pi_version}/${item.pi_file_name}`,
					key: item.pi_key
				}
			}
			if (item.user_email) {
				post['user'] = {
					email: item.user_email,
					name: item.user_name
				}
			}

			return post;
		});
	}

	private getCountAllPostWhenCreateWithCombinationData(combinationData: Array<any>): number {
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

	private remapDetailPost(detailPost: Array<any>): any {
		const result: any = { detail: {}, combinations: [], slides: [] };
		if (detailPost[0]) {
			result['detail'] = {
				id: detailPost[0].post_id,
				name: detailPost[0].name,
				slug: detailPost[0].slug,
				description: detailPost[0].description,
				summary: detailPost[0].summary,
				id_process_image: detailPost[0].id_process_image
			};
			if (detailPost[0].file_name !== '') {
				result['detail']['avatar'] = detailPost[0].file_name ? `${process.env.CLOUD_IMAGE_PATH}/${detailPost[0].path}/v${detailPost[0].version}/${detailPost[0].file_name}` : null;
			}
			if (detailPost[0].cat_id) {
				result['detail']['category'] = {
					id: detailPost[0].cat_id,
					name: detailPost[0].cat_slug,
					slug: detailPost[0].cat_slug
				}
			}
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

}
