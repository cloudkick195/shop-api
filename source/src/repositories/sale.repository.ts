import Knex from "knex";
import { Injectable } from "../decorators/injectable.decorator";
import { BaseRepository } from "./base.repository";
import { RepositoryInterface } from "../interfaces/repository.interface";
import { CustomerInterface } from "../models/customer/customer.input-api.model";
import { DBConnection } from '../database/connection';

@Injectable()
export class SaleRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name', 'description', 'type', 'type_select',
    'category_select', 'product_select', 'status', 'value'
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
    let selectQuery: string = `p.sale_id as id, p.name, p.description, p.type, p.type_select, p.category_select, p.product_select, p.status, p.value`;
    const params_sql: Array<string | number> = [];
    let joinRelation: string = ``;

    let sql = `SELECT ${selectQuery} FROM sales p ${joinRelation} WHERE p.${key} = ?`;
    params_sql.push(value);
    const [result] = await connection.raw(sql, params_sql);
    return result;
  }

  public async getListSale(): Promise<Array<any>> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).select();
  }

  public async removeSaleById(sale_id: string): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).del().where({ sale_id });
  }


  public async getDetailSale(saleId: string): Promise<any> {
    const saleDetail: Array<any> = await this.getSaleByKeyValue('sale_id', saleId);
    if (saleDetail && saleDetail[0]) {
      const saleId: number = saleDetail[0].sale_id;
      // const result: Array<any> = await Promise.all([
      //   this.getListCombinationOfSale(saleId),
      //   this.getListSaleSlides(saleId),
      //   this.saleEntityBackgroundRepository.getListEntityBackground(saleId),
      // ]);
      return [saleDetail[0]];
    }
    return [];
  }

  public async updateDataSale(saleId: number, dataUpdate: any, userActor: any): Promise<any> {
    let t: Knex.Transaction;
    try {
      const connection: Knex = this.dbConnector.getConnection();
      t = await connection.transaction();
      const { ...saleData } = dataUpdate;
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
   
    
    if (listKeys.length > 0) {
      return connection.raw(sql, sql_params);
    }
  }

  public async getSaleById(id: number) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('sales').select(['sales_id as id', 'name']).where({ id }).first();
  }
}
