import { Controller } from "../decorators/controller.decorator";
import { Request, Response } from "express";
import { Get, Post } from "../decorators/http-method.decorator";
import { UserRepository } from "../repositories/user.repository";
import { JWTMHelper } from "../helpers/jwt.helper";
import { RequestValidate } from '../utils/validators/request.validate';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { AES, DecryptedMessage, enc } from 'crypto-js';

@Controller('/auth')
export class AuthController {

	constructor(
		private userRespository: UserRepository,
		private jwtHelper: JWTMHelper
	) {
	}

	@Post('/login')
	public async login(request: Request, response: Response) {
		try {
			const data: any = request.body;
			const validation: any = {
				email: ['required', 'email'],
				password: ['required', 'minLength:6']
			};
			
			const validates: any = RequestValidate.handle(validation, data);
			if (!validates.success) {
				return raiseException(request, response, 400, "Validators fail", validates.errors);
			}
			const user: any = await this.userRespository.findUserByEmail(data.email);
			if (!user || !user.id) {
				return raiseException(request, response, 401, 'Invalid user and password');
			}
			const checkPassword: boolean = this.userRespository.comparePasswordUser(data.password, user.password);
			if (!checkPassword) {
				return raiseException(request, response, 401, 'Invalid user and password');
			}
			return responseServer(request, response, 200, 'Login successfully', { token: this.jwtHelper.createToken(user.id) })
		} catch (err) {
			return response.status(500).json({ code: 500, message: err.message });
		}
	}

	@Post('/register')
	public async register(request: Request, response: Response) {
		try {
			const data: any = request.body;
			const validation: any = {

				email: ['required', 'email'],
				password: ['required', 'minLength:6']
			};
			const validates: any = RequestValidate.handle(validation, data);
			if (validates.success) {
				const emailExisted: boolean = await this.checkEmailExist(data.email);
				if (!emailExisted) {
					const passwordDecryptor: DecryptedMessage = AES.decrypt(data.password.toString(), 'secret');
					const password: string = passwordDecryptor.toString(enc.Utf8);
				}
				raiseException(request, response, 409, "Email was existed !");
			}
		} catch (err) {
			return response.status(500).json({ code: 500, message: err.message });
		}
	}

	@Get('/')
	public async getTest(request: Request, response: Response) {
		return responseServer(request, response, 401, "Email was existed !")
	}

	private async checkEmailExist(email: string): Promise<boolean> {
		const user: any = await this.userRespository.findUserByEmail(email);
		if (user && user.id) {
			return true;
		}
		return false;
	}
}
