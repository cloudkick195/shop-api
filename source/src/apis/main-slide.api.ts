import { Controller } from "../decorators/controller.decorator";
import { Get, Post, Patch, Delete } from "../decorators/http-method.decorator";
import { Request, Response } from 'express';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { MainSlideRepository } from "../repositories/main-config/main-slide.repository";
import { ListSlideInputApiModel } from "../models/main-slide/list-slide.input-api.model";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";

@Controller('/main-slide')
export class MainSlideApi {
  constructor(
    private mainSlideRepository: MainSlideRepository
  ) { }

  @Post('/')
  public async createListSlides(request: Request, response: Response) {
    try {
      const body: any = request.body;
      const dataCreate: Array<ListSlideInputApiModel> = body.data.map((item: any) => ({
        id_process_image: item.process_image,
        link: item.link
      }));
      await this.mainSlideRepository.createMainSlide(dataCreate);
      return responseServer(request, response, 201, "Create successfully");
    } catch (error) {
      return raiseException(request, response, 500, "Can not create " + error.message);
    }
  }

  @Get('/')
  public async listSlides(request: Request, response: Response) {
    try {
      const data: Array<any> = await this.mainSlideRepository.getAllMainSlides();
      const result: Array<any> = this.remapListSlidesToResponseServer(data);
      return responseServer(request, response, 200, "Get list slides successfully", result);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Patch('/:slideId')
  public async updateSlideById(request: Request, response: Response) {
    try {
      const params: any = request.params;
      const body: any = request.body;
      await this.mainSlideRepository.updateMainSlide(body, params.slideId);
      return responseServer(request, response, 200, "Update successfully");
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Delete('/:slideId')
  public async removeSlide(request: Request, response: Response) {
    try {
      const params: any = request.params;
      const slideId: number = params.slideId;
      await this.mainSlideRepository.removeMainSlide(slideId);
      return responseServer(request, response, 202, "Remove slide successfully");
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private remapListSlidesToResponseServer(data: Array<any>): Array<any> {
    return data.map((item: any) => {
      return {
        id: item.id,
        link: item.link,
        image: `${process.env.CLOUD_IMAGE_PATH}/${item.path}/v${item.version}/${item.file_name}`
      }
    });
  }

  @Patch('/update-multi', [AdminAuthenticationMiddleware])
  public async updateMultiMainSlide(request: Request, response: Response) {
    try {
      const data: any = request.body;
      await this.mainSlideRepository.updateListMainSlide(data);
      return responseServer(request, response, 200, 'Update successfully');
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }
}