import Knex from "knex";
import { Injectable } from "../decorators/injectable.decorator";
import { BaseRepository } from "./base.repository";
import { RepositoryInterface } from "../interfaces/repository.interface";
import { CustomerInterface } from "../models/customer/customer.input-api.model";
import { DBConnection } from '../database/connection';

@Injectable()
export class SaleRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name', 'id_process_image', 'category_id', 'count',
    'slug', 'price', 'price_sale', 'sku', 'description', 'created_by', 'archive_by'
  ];
  private tableName: string = 'sales';

  constructor(
    private dbConnector: DBConnection,
    // private saleCombinationRepository: SaleCombinationRepository,
    // private saleSlideRepository: SaleSlideRepository,
    // private saleEntityBackgroundRepository: SaleEntityBackgroundRepository
  ) {
    super();
  }

  public async createSale(dataSale: any, user: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();

    try {
        const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable(dataSale));

        return await this.getSaleByKeyValue('sale_id', rowInsertId, []);
    } catch (error) {
      throw new Error(error.message);
    }
  }


  public async getSaleByKeyValue(key: string, value: string | number, relations: Array<string> = []): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let selectQuery: string = `p.sale_id, p.name, p.description`;
    const params_sql: Array<string | number> = [];
    let joinRelation: string = ``;

    let sql = `SELECT ${selectQuery} FROM sales p ${joinRelation} WHERE p.archive_by IS NULL AND p.${key} = ?`;
    params_sql.push(value);
    const [result] = await connection.raw(sql, params_sql);
    return result;
  }

  public async getListSale(): Promise<Array<any>> {
    const connection: Knex = this.dbConnector.getConnection();

    const [result] = await connection(this.tableName).select();
    return result;
  }

  public async removeSaleBySlug(slug: string, user: { id: number, email: string }): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slug }).update({ archive_by: user.id });
  }


  public async getDetailSale(saleSlug: string): Promise<any> {
    const saleDetail: Array<any> = await this.getSaleByKeyValue('slug', saleSlug, ['image', 'category']);
    if (saleDetail && saleDetail[0]) {
      const saleId: number = saleDetail[0].sale_id;
      const result: Array<any> = await Promise.all([
        // this.getListCombinationOfSale(saleId),
        // this.getListSaleSlides(saleId),
        // this.saleEntityBackgroundRepository.getListEntityBackground(saleId),
      ]);
      return [saleDetail[0], ...result];
    }
    return [];
  }

  public async updateDataSale(saleId: number, dataUpdate: any, userActor: any): Promise<any> {
    let t: Knex.Transaction;
    try {
      const connection: Knex = this.dbConnector.getConnection();
      t = await connection.transaction();
      const { newCombinations, updateCombinations, updateSlides, newSlides, avatar, newEntity, updateEntity, ...saleData } = dataUpdate;
      const listQueries: Array<Promise<any>> = [];

      if (saleData && Object.keys(saleData).length > 0) {
        listQueries.push(this.updateSaleInformation(saleId, saleData));
      }
      await Promise.all(listQueries);
      await t.commit();
      return true;
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error);
    }
  }

  private async updateSaleInformation(saleId: number, saleData: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql_params: Array<any> = [];
    let listKeys: Array<any> = Object.keys(saleData);
    let sql: string = `UPDATE sales SET `;
    listKeys.map((key: any, index: number) => {
      if (index !== 0) {
        sql += ',';
      }
      sql += ` ${key}=? `;
      sql_params.push(saleData[key]);
    });
    sql += ` WHERE sale_id = ? `;
    sql_params.push(saleId);
  }

  public async getSaleById(id: number) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('sales').select(['sales_id as id', 'name']).where({ id }).first();
  }
}
