import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { ProductSlideUpdate } from "../../models/product/update-product.api-model";
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductSlideRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['product_id', 'id_process_image'];
  private tableName: string = 'product_slides';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createListSlideForProduct(productSlideData: Array<any>, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).transacting(transaction).insert(productSlideData);
  }

  public async findProductSlideById(productSlideId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).select([
      'product_slide_id',
      'product_id',
      'link',
    ]).where({ is_archive: false, product_slide_id: productSlideId }).first();
  }

  public async removeProductSlide(productSlideId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ is_archive: false, product_slide_id: productSlideId }).first().update({ is_archive: true });
  }

  public async actionUpdateProductSlides(productId: number, dataUpdateSlide: ProductSlideUpdate[], transaction: Knex.Transaction): Promise<any> {
    return this.updateListProductSlide(productId, dataUpdateSlide, transaction);
  }

  public async updateListProductSlide(productId: number, productSlideUpdateData: any, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const dataStructure: any = {
      process_image: [],
      link: []
    };
    const dataMapping: any = {
      process_image: [],
      link: []
    };
    const listIds: Array<number> = [];
    const queryLists: Array<string> = [];
    productSlideUpdateData.map((item: any, index: number) => {
      if (item && item.id && item.id > 0) {
        listIds.push(item.id);
        if ('process_image' in item) {
          if (index === 0) {
            dataStructure.process_image.push(` id_process_image = CASE product_slide_id  `);
          }
          dataStructure.process_image.push(` WHEN ${item.id} THEN ? `);
          dataMapping.process_image.push(item.process_image);
        }
        if ('link' in item) {
          if (index === 0) {
            dataStructure.link.push(` link = CASE product_slide_id  `);
          }
          dataStructure.link.push(` WHEN ${item.id} THEN ? `);
          dataMapping.link.push(item.link);
        }
      }
    });
    Object.keys(dataStructure).map((item: any) => {
      if (item && dataStructure[item] && dataStructure[item].length > 0) {
        queryLists.push(dataStructure[item].join(""));
      }
    });
    let sql: string = `
      UPDATE product_slides SET 
          ${queryLists.join("  END, ")} END
      WHERE product_slide_id IN (${listIds.join()}) AND product_id = ?;
    `;
    if (dataStructure.process_image.length > 0 || dataStructure.link.length > 0) {
      return connection.raw(sql, [...dataMapping.process_image, ...dataMapping.link, productId]).transacting(transaction);
    }
  }
}
