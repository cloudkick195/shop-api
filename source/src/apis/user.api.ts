import { Response } from "express";
import { Get } from "../decorators/http-method.decorator";
import { Controller } from "../decorators/controller.decorator";
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { AdminAuthenticationMiddleware } from '../middlewares/admin.authenticate.middleware';
import { RequestHandler } from "../models/request/request.model";

@Controller('/user')
export class UserApi {
  @Get('/profile', [AdminAuthenticationMiddleware])
  public async getUserProfile(request: RequestHandler, response: Response) {
    try {
      const { name, email } =  request.user;
      return responseServer(request, response, 200, 'Get profile succesfully', { name, email })
    } catch (error) {
      return raiseException(request, response, 500, 'Fail to load profile', error.message);
    }
  }

  constructor() {}
}