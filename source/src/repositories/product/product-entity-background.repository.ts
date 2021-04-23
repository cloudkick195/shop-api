import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { ProductEntityImageUpdate } from '../../models/product/update-product.api-model';
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductEntityBackgroundRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['process_image', 'entity_id', 'product_id'];
  private tableName: string = 'product_attribute_entity_background';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createProductEntityBackground(productId: number, entityBackgrounData: Array<any>, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).transacting(transaction).insert(entityBackgrounData.map((item) => ({
      process_image: item.image,
      entity_id: item.entity_id,
      product_id: productId,
    })));
  }

  public async getListEntityBackground(productId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql: string = `
      SELECT 
          ANY_VALUE(paeb.id_attribute_entity_background) AS id_attribute_entity_background,
          paeb.entity_id,
          ANY_VALUE(paeb.process_image) AS process_image,
          ANY_VALUE(aet.entity_name) AS entity_name,
          ANY_VALUE(pi.path) AS path,
          ANY_VALUE(pi.file_name) AS file_name,
          ANY_VALUE(pi.process_key) AS process_key,
          ANY_VALUE(pi.version) AS version
      FROM
          product_attribute_entity_background paeb
              LEFT JOIN
          process_images pi ON pi.id_process_image = paeb.process_image
              LEFT JOIN
          attr_entity_type aet ON aet.id_entity_type = paeb.entity_id
      WHERE
          paeb.is_archive IS FALSE
              AND paeb.product_id = ?
      GROUP BY paeb.entity_id 
      ORDER BY id_attribute_entity_background DESC;
    `;

    const [result] = await connection.raw(sql, [productId]);
    return result;
  }

  public async updateListProductEntityBackground(productId: number, dataUpdate: ProductEntityImageUpdate[], transaction: Knex.Transaction): Promise<any> {
    const connection = this.dbConnector.getConnection();
    let query_string: string = ``;
    let query_case: string = ``;
    const query_params: Array<string | number> = [];
    dataUpdate.map((item: any, index: number) => {
      query_case += "  WHEN ? THEN ? ";
      query_params.push(item.id_background, item.process_image);
    });
    dataUpdate.map((item: any, index: number) => {
      query_string += `?`;
      if (index !== dataUpdate.length - 1) {
        query_string += ` , `;
      }
      query_params.push(item.id_background, productId);
    });
    let sql: string = `
      UPDATE product_attribute_entity_background 
      SET 
        process_image = CASE id_attribute_entity_background
            ${query_case}
        END
      WHERE
        id_attribute_entity_background IN (${query_string}) AND product_id = ?;
    `;
    return connection.raw(sql, query_params).transacting(transaction);
  }

  public async removeListEntityBackgroundByIdEntity(productId: number, listIdEntity: Array<number>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName)
      .where({ product_id: productId })
      .whereIn('entity_id', listIdEntity)
      .update({ is_archive: true });
  }
}