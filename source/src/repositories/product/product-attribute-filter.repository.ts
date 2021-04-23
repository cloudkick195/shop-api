import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductAttributeFilterRepository extends BaseRepository implements RepositoryInterface {
  public fillable: string[] = ['attribute_name', 'is_archive', 'have_entity_avatar'];
  public primaryKey: string = 'attribute_id';
  private tableName: string = 'product_attribute_entities';

  constructor(
    private readonly dbConnector: DBConnection
  ) {
    super();
  }

  public async getProductAttributeFilterById(attributeId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).select([
      'attribute_id',
      'attribute_name',
      'have_entity_avatar'
    ]).where({ is_archive: false, [this.primaryKey]: attributeId }).first();
  }

  public async prepareAndUpdateProductAttributeFilter(attributeId: number, data: any): Promise<any> {
    const attributeData: any = await this.getProductAttributeFilterById(attributeId);
    if (attributeData && attributeData.attribute_id) {
      return this.updateProductAttributeFilter(attributeId, data);
    }
  }

  public async updateProductAttributeFilter(attributeId: number, data: any): Promise<any> {
    const connection = this.dbConnector.getConnection();
    await connection(this.tableName).where({ [this.primaryKey]: attributeId }).update(super.composeDataWithFillable(data));
    return this.getProductAttributeFilterById(attributeId);
  }

  public async getListProductFilter(): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const entityTable: string = 'attr_entity_type';
    return connection(this.tableName).select([
      `${entityTable}.id_entity_type as entity_id`,
      `${entityTable}.entity_name`,
      `${this.tableName}.attribute_id`,
      `${this.tableName}.attribute_name`,
      `${this.tableName}.have_entity_avatar` 
    ]).leftJoin(entityTable, function () {
      this
      .on(`product_attribute_entities.attribute_id`, `${entityTable}.attr_id`)
      .on(`attr_entity_type.is_archive`, connection.raw('false'));
    })
    .where({ [`${this.tableName}.is_archive`]: false });
  }

  public async createProductAttributeFilter(dataAttribute: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable(dataAttribute));
    return this.getProductAttributeFilterById(rowInsertId);
  }
}