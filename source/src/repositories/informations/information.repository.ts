import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { CreateInformationInputApiModel } from "../../models/informations/create-information.input-api.model";
import { DBConnection } from "../../database/connection";
import { Dictionary } from "../../models/common/type.model";

@Injectable()
export class InformationRepository extends BaseRepository implements RepositoryInterface {
  public fillable: string[] = ['key', 'value', 'is_archive'];
  private tableName: string = 'informations';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createInformation(data: CreateInformationInputApiModel): Promise<any> {
    try {
      const connection: Knex = this.dbConnector.getConnection();
      const [informationId] = await connection(this.tableName).insert(data);
      if (informationId) {
        return this.getInformationByCondition({ info_id: informationId });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  public async getInformationByCondition(condition: Dictionary, isMultiple: boolean = false): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const conditions: Dictionary = {is_archive: false, ...condition};
    const query = connection(this.tableName).select(['info_id', 'key', 'value', 'type']).where(conditions);
    if (!isMultiple) {
      return query.first();
    }
    return query;
  }

  public async removeInformation(informationKey: string): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ key: informationKey }).first().update({ is_archive: true });
  }

  public async updateInformation(informationKey: string, data: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ key: informationKey }).first().update({ value: data.value });
  }
}