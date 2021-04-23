import { Controller } from "../decorators/controller.decorator";
import { Post, Get, Delete } from "../decorators/http-method.decorator";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { Request, Response } from 'express';
import { CustomerFeedbackEntityModel } from "../models/customer-feedback/customer-feedback-entity.model";
import { CustomerFeedbackRepository } from "../repositories/customer-feedback.repository";
import { RedisClientFacade } from "../cache/redis.client";
import { RequestValidate } from "../utils/validators/request.validate";

@Controller('/feedback')
export class CustomerFeedback {
    private cacheFeedbackKey: string = 'feedback';
    
    constructor(
        private readonly customerFeedbackRepository: CustomerFeedbackRepository,
        private readonly redisCache: RedisClientFacade
    ) { }

    @Post('/', [AdminAuthenticationMiddleware])
    public async createCustomerFeedback(request: Request, response: Response) {
        try {
            const data: CustomerFeedbackEntityModel = request.body;
            const validates: any = RequestValidate.handle({
                id_process_image: ['required'],
            }, data);
            if (validates.success) {
                const result: Array<any> = await this.customerFeedbackRepository.createCustomerFeedback(data.id_process_image);
                if (result && result[0]) {
                    const checkExistInCache: any = await this.redisCache.getKey(this.cacheFeedbackKey);
                    if (!checkExistInCache) {
                        await this.redisCache.setKey(this.cacheFeedbackKey, JSON.stringify([result[0]]));
                    } else {
                        const feedbackDataCache: Array<any> = JSON.parse(checkExistInCache);
                        feedbackDataCache.push(result[0]);
                        await this.redisCache.setKey(this.cacheFeedbackKey, JSON.stringify(feedbackDataCache));
                    }
                }
                return responseServer(request, response, 201, "Create customer feedback successfully", result[0]);
            }
            return raiseException(request, response, 400, "Not process image provider");
        } catch (error) {
            return raiseException(request, response, 500, error.message);
        }
    }

    @Get('/', [AdminAuthenticationMiddleware])
    public async getListCustomerFeedbacks(request: Request, response: Response) {
        try {
            const dataInCache: Array<any> = await this.getFeedbackCacheData();
            let data: Array<any> = [];
            if (dataInCache && dataInCache.length > 0) {
                data = dataInCache;
            } else {
                data = await this.customerFeedbackRepository.getListCustomerFeedback();
                this.redisCache.setKey(this.cacheFeedbackKey, JSON.stringify(data));
            }
            return responseServer(request, response, 200, 'Get list feedback successfully', data);
        } catch (error) {
            return raiseException(request, response, 500, error.message);
        }
    }

    private async getFeedbackCacheData(): Promise<Array<any>> {
        const dataInCache: string = await this.redisCache.getKey(this.cacheFeedbackKey);
        if (dataInCache) return JSON.parse(dataInCache);
        return [];
    }

    @Delete('/:feedbackId', [AdminAuthenticationMiddleware])
    public async removeCustomerFeedback(request: Request, response: Response) {
        try {
            const params: any = request.params;
            let dataInCache: Array<any> = await this.getFeedbackCacheData();
            if (dataInCache && dataInCache.length > 0) {
                dataInCache = dataInCache.filter((item: any) => item.id  != params.feedbackId);
            }
            // Remove in db schema
            await this.customerFeedbackRepository.removeCustomerFeedback(params.feedbackId);
            // Reset cache
            await this.redisCache.setKey(this.cacheFeedbackKey, JSON.stringify(dataInCache));
            return responseServer(request, response, 202, 'Remove customer feedback successfully');
        } catch (error) {
            return responseServer(request, response, 500, "Error when remove " + error.message);
        }
    }
}