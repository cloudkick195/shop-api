import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { ProductCombinationTypeRepository } from "./product-combination-type.repository";
import { ProductEntityBackgroundRepository } from "./product-entity-background.repository";
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductCombinationRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['product_id', 'count', 'is_archive', 'combination_sku'];
  private tableName: string = 'product_attribute_combinations';

  constructor(
    private dbConnector: DBConnection,
    private productCombinationTypeRepository: ProductCombinationTypeRepository,
    private productEntityBackgroundRepository: ProductEntityBackgroundRepository
  ) {
    super();
  }

  public async createCombination(productId: number, count: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable({ product_id: productId, count }));
    return this.getCombinationById(rowInsertId);
  }

  public async getCombinationById(combinationId: number): Promise<any> {
    const connection: Knex = await this.dbConnector.getConnection();
    return connection(this.tableName).select([
      'combination_id',
      'product_id',
      'count',
      'combination_sku'
    ]).where({ is_archive: false, combination_id: combinationId }).first();
  }

  public async checkExistCombinationById(combinationId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const productAttributeEntityCombinationsTable: string = 'product_attribute_entity_combinations';
    return connection(this.tableName)
      .select([
        `${this.tableName}.combination_id`,
        `${this.tableName}.product_id`,
        `${this.tableName}.count`,
        `${this.tableName}.combination_sku`,
        `${productAttributeEntityCombinationsTable}.entity_id`
      ])
      .leftJoin(productAttributeEntityCombinationsTable, `${productAttributeEntityCombinationsTable}.combination_id`, `${this.tableName}.combination_id`)
      .where({ [`${this.tableName}.is_archive`]: false, [`${this.tableName}.combination_id`]: combinationId });
  }

  public async checkExistCombinationBySku(combinationSku: string): Promise<any> {
    console.log('combinationSku: ', combinationSku);
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName)
      .select([
        `${this.tableName}.combination_id`,
        `${this.tableName}.product_id`,
        `${this.tableName}.count`,
        `${this.tableName}.combination_sku`
      ])
      .where({ [`${this.tableName}.combination_sku`]: combinationSku });
  }

  public async prepareAndCreateCombinationForProduct(productId: number, combinationData: Array<any>, returnCombinationData: boolean = false, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    
    const [rowInsertId] = await connection(this.tableName).transacting(transaction).insert(combinationData.map((item) => ({
      product_id: productId,
      count: item.count,
      combination_sku: item.combination_sku,
    })));
    if (returnCombinationData) {
      return this.getCombinationById(rowInsertId);
    }
    const dataCombinationEntity: Array<any> = [];
    combinationData.map((item: any, index: number) => {
      const combinationId: number = rowInsertId + index;
      item.value.map((child: any) => {
        dataCombinationEntity.push({
          entity_id: child, combination_id: combinationId, product_id: productId
        });
      });
    });
    await this.productCombinationTypeRepository.prepareAndCreateListProductCombinationEntity(dataCombinationEntity, transaction);
  }

  public async removeCombination(combinationId: number): Promise<any> {
    const connection: Knex = await this.dbConnector.getConnection();
    try {
      const currentCombination: Array<any> = await this.checkExistCombinationById(combinationId);
      
      if (currentCombination && currentCombination.length > 0 && currentCombination[0].combination_id) {
        let listQueries: Array<Promise<any>> = [];
        listQueries.push(connection(this.tableName).where({ combination_id: currentCombination[0].combination_id }).first().del());
       
        
        const listIds: Array<number> = currentCombination.map((item: any) => item.entity_id);
        if (listIds && listIds.length > 0) {
          const listEntityDataInCombinations: Array<any> = await this.productCombinationTypeRepository.checkListEntityInCombination(currentCombination[0].product_id, listIds);
          if (listEntityDataInCombinations && listEntityDataInCombinations[0] && listEntityDataInCombinations[0].length > 0) {
            const attributeCombinations: any = {};
            let listIdsToRemoveInBackground: Array<any> = [];
            listEntityDataInCombinations[0].map((item: any) => {
              if (!attributeCombinations[item.entity_id]) {
                attributeCombinations[item.entity_id] = [item.combination_id];
              } else {
                attributeCombinations[item.entity_id].push(item.combination_id);
              }
            });
            Object.keys(attributeCombinations).map((key: string) => {
              if (key && attributeCombinations[key] && attributeCombinations[key].length < 2) {
                listIdsToRemoveInBackground.push(parseInt(key));
              }
            });
            if (listIdsToRemoveInBackground && listIdsToRemoveInBackground.length > 0) {
              listQueries.push(this.productEntityBackgroundRepository.removeListEntityBackgroundByIdEntity(currentCombination[0].product_id, listIdsToRemoveInBackground));
            }
          }
        }
        return Promise.all(listQueries);
      }
      throw new Error("Not have any records");
    } catch (error) {
      console.log(3, error);
      
      throw new Error(error.message);
    }
  }

  public async updateListCombinationId(productId: number, dataUpdate: any, transaction: Knex.Transaction): Promise<any> {
    return this.updateListProductCombinationData(productId, dataUpdate, transaction);
  }

  public async updateCount(combination_sku: string, dataUpdate: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    console.log('combination_sku: ', combination_sku);
    console.log('dataUpdate: ', dataUpdate);
    return connection(this.tableName).where({ 'combination_sku': combination_sku }).update({ 'count': dataUpdate });
  }

  private async updateListProductCombinationData(productId: number, dataUpdate: any[], transaction: Knex.Transaction): Promise<any> {
    try {
      const connection: Knex = this.dbConnector.getConnection();
      const dataStructure: any = {
        image: [],
        count: [],
        combination_sku: []
      };
      const dataMapping: any = {
        image: [],
        count: [],
        combination_sku: []
      };
      const listIds: Array<number> = [];
      const queryLists: Array<string> = [];
      dataUpdate.map((item: any, index: number) => {
        if (item && item.id && item.id > 0) {
          listIds.push(item.id);
          if ('count' in item) {
            if (index === 0) {
              dataStructure.count.push(` count = CASE combination_id  `);
              dataStructure.combination_sku.push(` combination_sku = CASE combination_id  `);
            }
            dataStructure.count.push(` WHEN ${item.id} THEN ? `);
            dataStructure.combination_sku.push(` WHEN ${item.id} THEN ? `);
            dataMapping.count.push(item.count);
            dataMapping.combination_sku.push(item.combination_sku);
          }
        }
      });
      Object.keys(dataStructure).map((item: any) => {
        if (item && dataStructure[item] && dataStructure[item].length > 0) {
          queryLists.push(dataStructure[item].join(""));
        }
      });
      
      let sql: string = `
                UPDATE product_attribute_combinations SET 
                    ${queryLists.join("  END, ")} END
                WHERE product_id = ${productId} AND combination_id IN (${listIds.join()});
            `;
           
      if (dataStructure.image.length > 0 || dataStructure.count.length > 0) {
        return connection.raw(sql, [...dataMapping.count, ...dataMapping.combination_sku]).transacting(transaction);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
