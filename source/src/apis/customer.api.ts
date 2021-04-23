import { Controller } from "../decorators/controller.decorator";
import { Request, Response } from "express";
import { Post, Get, Delete, Patch } from "../decorators/http-method.decorator";
import { CustomerRepository } from "../repositories/customer.repository";
import { RequestValidate, RequestValidateResult } from '../utils/validators/request.validate';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";
import { RequestHandler } from "../models/request/request.model";
import { HashingHelper } from "../helpers/hash.helper";
import { Dictionary } from "../models/common/type.model";
import { CustomerModel } from '../models/customer/customer.input-api.model';

@Controller('/customer')
export class CustomerController {
  @Post('/create', [AdminAuthenticationMiddleware])
  public async create(request: Request, response: Response) {
    try {
      const data: any = request.body;
      const validation: any = {
        email:    ['required', 'email'],
        password: ['required', 'minLength:6'],
        name:     ['required'],
        birth_day: ['required'],
        gender:   ['required'],
      };
      const validates: RequestValidateResult = RequestValidate.handle(validation, data);
      if (!validates.success) {
        return raiseException(request, response, 400, 'Validate fail', validates.errors);
      }
      const emailExisted: boolean = await this.checkEmailExist(data.email);
      if (emailExisted) {
        return raiseException(request, response, 409,'Email has been registerd');
      }
      // const passwordDecryptor: DecryptedMessage = AES.decrypt(data.password.toString(), 'secret');
      // const password: string = passwordDecryptor.toString(enc.Utf8);
    } catch (err) {
      return response.status(500).json({ code: 500, message: err.message });
    }
  }

  @Get('/')
  public async index(request: Request, response: Response) {
    try {
      const params: Dictionary<string> = request.query as Dictionary<string>;
      const data: [Array<any>, { count: number }] = await this.customerRepository.getListCustomer(parseInt(params.offset), parseInt(params.limit), params.keyword);
      if (data && data[0] && data[0].length > 1) {
        const result: any = this.transformListCustomers(data[0]);
        return responseServer(request, response, 200, 'Get list products successfully', {
          data: result,
          count: data[1].count
        });
      }
      return responseServer(request, response, 200, 'Get list products successfully', [])
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private transformListCustomers(data: Array<any>): Array<any> {
    return data.map((item: any) => {
      return {
        customer_id: item.customer_id,
        name: item.name,
        birth_day: item.birth_day,
        gender: item.gender,
        email: item.email,
        password: item.password,
        phone: item.phone,
        address: item.address,
        type: item.type,
        creation_date: item.creation_date
      };
    });
  }

  @Delete('/:id', [AdminAuthenticationMiddleware])
  public async removeCustomer(request: RequestHandler, response: Response) {
    try {
      const params: any = request.params;
      await this.customerRepository.removeCustomerById(params.id);
      return responseServer(request, response, 202, 'Remove customer succesfully');
    } catch (error) {
      return raiseException(request, response, 500, 'Fail to delete customer');
    }
  }

  @Get('/:id')
  public async getCustomerById(request: Request, response: Response) {
    try {
      const params = request.params;
      const customer: CustomerModel = await this.customerRepository.getDetailCustomer(parseInt(params.id));
      if (!customer || !customer.customer_id) {
        return raiseException(request, response, 404, 'Can not find any customer');
      }
      return responseServer(request, response, 200, "Get info product successfully", {
        name: customer.name,
        birth_day: customer.birth_day,
        gender: customer.gender,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        type: customer.type
      });
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Patch('/:id', [AdminAuthenticationMiddleware])
  public async updateCustomer(request: RequestHandler, response: Response) {
    try {
      const params: any = request.params;
      const data: any = request.body;
      const customer: any = await this.customerRepository.getCustomerByKeyValue('email', params.email);
      if (customer && customer.id) {
        await this.customerRepository.updateDataCustomer(customer.customer_id, data);
        return responseServer(request, response, 200, "Update product successfully");
      }
      return raiseException(request, response, 404, "Can not found any product");
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Patch('/:id/reset-password', [AdminAuthenticationMiddleware])
  public async resetPasswordCustomer(request: Request, response: Response) {
    try {
      const params: Dictionary = request.params;
      const customer: CustomerModel = await this.customerRepository.getDetailCustomer(parseInt(params.id));
      if (!customer || !customer.customer_id) {
        return raiseException(request, response, 404, 'Customer not found');
      }
      const password: string = await this.hashingHelper.hashPassword(process.env.CUSTOMER_PASSWORD_DEFAULT);
      await this.customerRepository.updateDataCustomer(customer.email, { password });
      return responseServer(request, response, 200, 'Reset password succesfully');
    } catch (error) {
      return raiseException(request, response, 500, 'Can not reset password for customer');
    }
  }

  private async checkEmailExist(email: string): Promise<boolean> {
    const result: any = await this.customerRepository.findCustomerByEmail(email);
    if (result && result.length > 0) {
      return true;
    }

    return false;
  }

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly hashingHelper: HashingHelper,
  ) {
  }
}
