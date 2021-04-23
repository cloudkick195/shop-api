import { Controller } from "../decorators/controller.decorator";
import { Delete } from "../decorators/http-method.decorator";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { Request, Response } from 'express';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { ProductCombinationRepository } from "../repositories/product/product-combination.repository";

@Controller('/product-combination')
export class ProductCombinationApi {

    constructor(
        private productCombinationRepository: ProductCombinationRepository
    ) {}

    @Delete('/:combinationId', [AdminAuthenticationMiddleware])
    public async removeCombination(request: Request, response: Response) {
        try {
            const params: any = request.params;
            if (params.combinationId && params.combinationId > 0) {
                await this.productCombinationRepository.removeCombination(params.combinationId);
                return responseServer(request, response, 202, 'Remove combination successfully');
            }
            return raiseException(request, response, 404, "Can not find any records here");
        } catch (error) {
            return raiseException(request, response, 500, error.message);
        }
    }
}