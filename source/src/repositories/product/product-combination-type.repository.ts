import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductCombinationTypeRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['entity_id', 'combination_id', 'product_id'];
  private tableName: string = 'product_attribute_entity_combinations';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async prepareAndCreateListProductCombinationEntity(combinationTypeData: Array<any>, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).transacting(transaction).insert(combinationTypeData);
  }

  public async checkListEntityInCombination(productId: number, listIds: Array<number>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const productAttributeCombinationsTable: string = 'product_attribute_combinations';
    return connection(this.tableName)
      .select('*')
      .leftJoin(productAttributeCombinationsTable, `${productAttributeCombinationsTable}.combination_id`, `${this.tableName}.combination_id`)
      .where({ [`${this.tableName}.product_id`]: productId, [`${productAttributeCombinationsTable}.is_archive`]: false })
      .whereIn(`${this.tableName}.entity_id`, listIds);
  }
}
