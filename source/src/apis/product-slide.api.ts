import { Controller } from "../decorators/controller.decorator";
import { ProductSlideRepository } from "../repositories/product/product-slide.repository";
import { Delete } from "../decorators/http-method.decorator";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { Request, Response } from "express";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";

@Controller('/product-slide')
export class ProductSlideApi {
    constructor(
        private productSlideRepository: ProductSlideRepository
    ) { }

    @Delete('/:productSlideId', [AdminAuthenticationMiddleware])
    public async removeProductSlideViaId(request: Request, response: Response) {
        try {
            const params: any = request.params;
            const productSlide: any = await this.productSlideRepository.findProductSlideById(params.productSlideId);
            if (productSlide && productSlide.product_slide_id) {
                await this.productSlideRepository.removeProductSlide(params.productSlideId);
                return responseServer(request, response, 202, "Remove product slide successfully");
            }
            return raiseException(request, response, 404, "Product slide can not found");
        } catch (error) {
            return raiseException(request, response, 500, error.message);
        }
    }
}