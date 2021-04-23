import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { CreateProductEntityFilterInputApiModel } from "../../models/product-filter/input-api/create-product-entity-filter.input-api.model";
import { DBConnection } from "../../database/connection";
import Knex from "knex";

@Injectable()
export class ProductFilterRepository extends BaseRepository implements RepositoryInterface {
  public fillable: string[] = [
    'entity_name', 'attr_id', 'is_archive'
  ];
  public primaryKey: string = 'id_entity_type';
  private tableName: string = 'attr_entity_type';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createProductEntity(dataEntity: CreateProductEntityFilterInputApiModel): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable(dataEntity));
    return this.getProductEntityFilterById(rowInsertId);
  }

  public async getProductEntityFilterById(entityId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).select([
      'id_entity_type as entity_id',
      'entity_name',
      'attr_id as attribute_id',
    ]).where({ is_archive: false, id_entity_type: entityId }).first();
  }

  public async prepareAndUpdateEntityFilter(entityId: number, data: any): Promise<any> {
    const entityData: any = await this.getProductEntityFilterById(entityId);
    if (entityData && entityData.entity_id) {
      return this.updateProductEntityFilter(entityId, data);
    }
  }

  public async updateProductEntityFilter(entityId: number, data: any): Promise<any> {
    const connection: Knex = await this.dbConnector.getConnection();
    await connection(this.tableName).where({ [this.primaryKey]: entityId }).first().update(super.composeDataWithFillable(data));
    return this.getProductEntityFilterById(entityId);
  }
}

