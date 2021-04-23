import { Delete, Get, Patch, Post } from "../decorators/http-method.decorator";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { RequestValidate, RequestValidateResult } from "../utils/validators/request.validate";
import { PolicyPostRepository } from "../repositories/policy-post/policy-post.repository";
import { PolicyPostEntity } from "../models/policy-post/entity/policy-post-entity";
import { Request, Response } from 'express';
import { Controller } from "../decorators/controller.decorator";
import { Str } from "../utils/slugable/slug.function";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";

@Controller('/policy-post')
export class PolicyApi {
	constructor (
		private policyPostRepository: PolicyPostRepository
	) {
	}
	
	@Post('/', [ AdminAuthenticationMiddleware ])
	public async createPolicyPost (request: Request, response: Response) {
		try {
			const data: any = request.body;
			if (data.post_name && !data.post_slug) {
				data.post_slug = Str.slug(data.post_name);
			}
			const validates: any = RequestValidate.handle({
				post_name: [ 'required' ],
				post_slug: [ 'required' ]
			}, data);
			if (validates.success) {
				const policyPostWithSlug: any = await this.policyPostRepository.getPolicyPostByCondition({ post_slug: data.post_slug });
				if (policyPostWithSlug && policyPostWithSlug.post_id) {
					return raiseException(request, response, 409, "Post slug or name is already exists !");
				}
				const result: PolicyPostEntity[] = await this.policyPostRepository.createNewPolicyPost(data);
				return responseServer(request, response, 201, "Create policy post successfully", result[0]);
			}
			return raiseException(request, response, 400, "Validators fail", validates.errors);
		} catch ( e ){
			return raiseException(request, response, 500, e.message);
		}
	}
	
	@Get('/', [ AdminAuthenticationMiddleware ])
	public async getListPolicyPost (request: Request, response: Response) {
		try {
			const params: any = request.query;
			const [data, { count }] = await this.policyPostRepository.getListPolicyPost(params);
			if (!data || data.length === 0) {
				return responseServer (request, response, 200, 'Get list products successfully', [])
			}
			return responseServer (request, response, 200, 'Get list policy post successfully', {
				data,
				count,
			});
		} catch ( e ){
			return raiseException(request, response, 500, e.message);
		}
	}
	
	@Delete('/:policyPostId', [AdminAuthenticationMiddleware])
	public async removePolicyPost(request: Request, response: Response) {
		try {
			const params: any = request.params;
			await this.policyPostRepository.removePolicyPostById(params.policyPostId);
			return responseServer (request, response, 202, 'Remove policy post successfully');
		} catch ( e ){
			return raiseException(request, response, 500, e.message);
		}
	}
	
	@Get('/:policyPostId', [AdminAuthenticationMiddleware])
	public async getPolicyPostDetail(request: Request, response: Response) {
		try {
			const params: any = request.params;
			const policyPost: any = await this.policyPostRepository.getPolicyPostByCondition({ post_id: params.policyPostId });
			if (!policyPost || !policyPost.post_id) {
				return raiseException(request, response, 404, "Can not get any policy post with condition");
			}
			return responseServer(request, response, 200, "Get detail policy post successfully", policyPost);
		} catch (e){
			return raiseException(request, response, 500, e.message);
		}
	}
	
	@Patch('/:policyPostId', [AdminAuthenticationMiddleware])
	public async updatePolicyPost(request: Request, response: Response) {
		try {
			const params: any = request.params;
			const data: any = request.body;
			const validateResult: RequestValidateResult = RequestValidate.handle({
				post_name: [ 'required' ],
				post_slug: [ 'required' ]
			}, data, true);
			if (!validateResult.success) {
				return raiseException(request, response, 400, validateResult.errors.join(', '));
			}
			const currentPolicyPost: PolicyPostEntity = await this.policyPostRepository.getPolicyPostByCondition({ post_id: params.policyPostId });
			if (!currentPolicyPost || !currentPolicyPost.post_id) {
				return raiseException(request, response, 404, "Can not find any policy post");
			}
			await this.policyPostRepository.updatePolicyPost(params.policyPostId, request.body);
			return responseServer(request, response, 200, "Update policy post successfully");
		} catch (e){
			return raiseException(request, response, 500, e.message);
		}
	}
}
