import { Controller } from './../decorators/controller.decorator';
import { Get, Post } from './../decorators/http-method.decorator';
import { Request, Response } from 'express';
import { FileHelper } from './../helpers/file.helper';
import { UploadCloudinaryService } from './../services/upload-cloudinary.service';
import { MediaRepository } from './../repositories/media.repository';
import { AuthenticationMiddleware } from '../middlewares/authentication.middleware';
import { responseServer, raiseException } from '../utils/exceptions/raise.exception';
import { RequestHandler } from '../models/request/request.model';
import { AdminAuthenticationMiddleware } from '../middlewares/admin.authenticate.middleware';
import { RequestValidate } from '../utils/validators/request.validate';
import { CreateMediaFolderApiModel } from '../models/media/media-folder/create-media-folder.api-model';
import { MediaFolderRepository } from '../repositories/media/media-folder.repository';
import { createImagePath } from '../utils/transform/image.transform';

@Controller('/media')
export class MediaController {
	constructor(
		private fileHelper: FileHelper,
		private uploadCloudService: UploadCloudinaryService,
		private mediaRepository: MediaRepository,
		private mediaFolderRepository: MediaFolderRepository
	) { }

	@Post('/upload/image', [AuthenticationMiddleware])
	public async uploadImage(request: RequestHandler, response: Response) {
		try {
			const files: any = this.fileHelper.getFilesInRequest(request);
			const result: Array<string> = await this.uploadImageToCloudinary(files);
			const dataToSave: Array<any> = result.map((item: any) => ({
				process_key: item.public_id,
				path: 'image/upload',
				file_name: `${ item.public_id }.${ item.format }`,
				driver: 3,
				version: item.version,
				signature: item.signature,
				resource_type: item.resource_type,
				folder_id: request.folderId
			}));
			const data = await this.mediaRepository.createMediaRow(dataToSave);
			return responseServer(request, response, 201, 'Upload successfully', data);
		} catch (e) {
			return raiseException(request, response, 500, e.message);
		}
	}

	private async uploadImageToCloudinary(files: { [key: string]: Array<File> }): Promise<Array<string>> {
        try {
            const data: Array<string> = await this.uploadCloudService.uploadToCloudinary(files.file);
            return data;
        } catch (e) {
        	throw new Error("Error when upload to cloud " + e);
        }
	}
	
	@Post('/folder', [AdminAuthenticationMiddleware])
	public async createFolder(request: Request, response: Response) {
		try {
			const data: CreateMediaFolderApiModel = request.body;
			const validations: any = RequestValidate.handle({
				name: ['required'],
				parent_id: ['required']
			}, request.body);
			if (validations.success) {
				const folder: Array<any> = await this.mediaFolderRepository.createNewMediaFolder(data);
				return responseServer(request, response, 201, "Create media folder successfully", folder);
			}

			return raiseException(request, response, 400, validations.errors);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}

	@Get('/folder', [AdminAuthenticationMiddleware])
	public async getListFolder(request: Request, response: Response) {
		try {
			const params: any = request.query;
			const validations: any = RequestValidate.handle({
				page: ['required'],
				limit: ['required'],
				parent_id: ['required'],
				offset: ['isNum']
			}, params);
			if (validations.success) {
				const result: Array<any> = await this.mediaFolderRepository.getMediaFolderDetail(
					params.parent_id,
					(params.page * params.limit) - params.limit,
                    parseInt(params.limit),
                    params.offset || 0
				);
				return responseServer(
					request,
					response, 
					200, 
					"Get list folder successfully", 
					{ 
						folders: result[0], 
						images: result[1].map((item: any) => ({
							id: item.id_process_image,
							process_key: item.process_key,
							path: createImagePath(item),
							resource_type: item.resource_type,
							version: item.version
						}))
					})
			}
			return raiseException(request, response, 400, validations.errors);
		} catch (error) {
			return raiseException(request, response, 500, error.message);
		}
	}
}
