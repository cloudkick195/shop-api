import { Controller } from "../decorators/controller.decorator";
import { InformationRepository } from "../repositories/informations/information.repository";
import { Get, Post, Delete, Patch } from "../decorators/http-method.decorator";
import { Request, Response } from 'express';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { CreateInformationInputApiModel } from "../models/informations/create-information.input-api.model";
import { RedisClientFacade } from "../cache/redis.client";
import { AdminAuthenticationMiddleware } from "../middlewares/admin.authenticate.middleware";

@Controller('/information')
export class InformationApi {
  constructor(
    private informationRepository: InformationRepository,
    private redisCache: RedisClientFacade
  ) { }

  @Post('/', [AdminAuthenticationMiddleware])
  public async createInformation(request: Request, response: Response) {
    try {
      const data: any = request.body;
      if (!data.key) {
        return raiseException(request, response, 400, 'No key provider for create infomation');
      }
      const information: any = await this.informationRepository.getInformationByCondition({ key: data.key });
      if (information && information.info_id) {
        return responseServer(request, response, 409, "Key has been provider for other item");
      }
      const result: any = await this.informationRepository.createInformation(this.mapDataToCreateInformation(data));
      let dataResult: any = {};
      if (result && result.info_id) {
        const checkExistInCache: any = await this.redisCache.getKey('informations');
        if (!checkExistInCache) {
          await this.redisCache.setKey('informations', JSON.stringify([result]));
        } else {
          const informationDataCache: Array<any> = JSON.parse(checkExistInCache);
          informationDataCache.push(result);
          await this.redisCache.setKey('informations', JSON.stringify(informationDataCache));
        }
        dataResult = result;
      }
      return responseServer(request, response, 201, "Create information successfully", dataResult);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  private mapDataToCreateInformation(data: any): CreateInformationInputApiModel {
    return { key: data.key, value: data.value, type: data.type };
  }

  @Get('/')
  public async getListInformations(request: Request, response: Response) {
    try {
      const dataInCache: Array<any> = await this.getInformationsCacheData();
      let data: Array<any> = [];
      if (dataInCache && dataInCache.length > 0) {
        data = dataInCache;
      } else {
        data = await this.informationRepository.getInformationByCondition({}, true);
        this.redisCache.setKey('informations', JSON.stringify(data));
      }
      return responseServer(request, response, 200, 'Get list information successfully', data);
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }

  @Delete('/:informationKey', [AdminAuthenticationMiddleware])
  public async removeInformation(request: Request, response: Response) {
    try {
      const params: any = request.params;
      let dataInCache: Array<any> = await this.getInformationsCacheData();
      if (dataInCache && dataInCache.length > 0) {
        dataInCache = dataInCache.filter((item: any) => item.key !== params.informationKey);
      }
      // Remove in db schema
      await this.informationRepository.removeInformation(params.informationKey);
      // Reset cache
      await this.redisCache.setKey('informations', JSON.stringify(dataInCache));
      return responseServer(request, response, 202, 'Remove information successfully');
    } catch (error) {
      return responseServer(request, response, 500, "Error when remove " + error.message);
    }
  }

  @Patch('/:key', [AdminAuthenticationMiddleware])
  public async updateInformation(request: Request, response: Response) {
    try {
      const params: any = request.params;
      const data: any = request.body;
      if (data.value) {
        let dataInCache: Array<any> = await this.getInformationsCacheData();
        if (dataInCache) {
          dataInCache = this.updateListInformationToUpdateCache(dataInCache, params.key, data.value);
        }
        await this.informationRepository.updateInformation(params.key, data);
        await this.setInformationCache(JSON.stringify(dataInCache));
      }
      return responseServer(request, response, 200, 'Update successfully');
    } catch (error) {
      return responseServer(request, response, 500, "Error when remove " + error.message);
    }
  }

  private updateListInformationToUpdateCache(listCacheData: Array<any>, key: string, newValue: string): Array<any> {
    const index: number = listCacheData.findIndex((item: any) => item.key == key);
    if (index !== -1) {
      listCacheData[index].value = newValue;
    }
    return listCacheData;
  }

  private async getInformationsCacheData(): Promise<Array<any>> {
    const dataInCache: string = await this.redisCache.getKey('informations');
    if (dataInCache && dataInCache !== 'undefined') { return JSON.parse(dataInCache) };
    return [];
  }

  private async setInformationCache(data: any): Promise<void> {
    this.redisCache.setKey('informations', data);
  }
}