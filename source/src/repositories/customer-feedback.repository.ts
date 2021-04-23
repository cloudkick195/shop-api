import Knex from "knex";
import { Injectable } from "../decorators/injectable.decorator";
import { BaseRepository } from "./base.repository";
import { RepositoryInterface } from "../interfaces/repository.interface";
import { PoolConnection } from "mysql2/promise";
import { DBConnection } from "../database/connection";

@Injectable()
export class CustomerFeedbackRepository extends BaseRepository implements RepositoryInterface {
  public fillable: string[] = ['id_process_image', 'is_archive'];
  private tableName: string = 'customer_feedbacks';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createCustomerFeedback(processImage: number): Promise<any> {
    let t: Knex.Transaction;
    try {
      const connection: Knex = await this.dbConnector.getConnection();
      t = await connection.transaction();
      const [rowInsertId] = await connection(this.tableName).insert({ id_process_image: processImage }).transacting(t);
      await t.commit();
      if (rowInsertId) {
        return this.getCustomerFeedBackById(rowInsertId);
      }
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error);
    }
  }

  public async getCustomerFeedBackById(feedbackId: number) {
    const connection: Knex = await this.dbConnector.getConnection();
    const sql: string = `
      SELECT 
          id, pi.path, pi.version, pi.process_key, pi.file_name
      FROM
          customer_feedbacks cf
              LEFT JOIN
          process_images pi ON pi.id_process_image = cf.id_process_image
      WHERE
          cf.is_archive IS FALSE
              AND id = ?
          `;
    const [result] = await connection.raw(sql, [feedbackId]);
    return result;
  }

  public async getListCustomerFeedback(): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const sql: string = `
      SELECT 
        id, pi.path, pi.version, pi.process_key, pi.file_name
      FROM
        customer_feedbacks cf
      LEFT JOIN
        process_images pi ON pi.id_process_image = cf.id_process_image
      WHERE
        cf.is_archive IS FALSE
    `;
    const [result] = await connection.raw(sql);
    return result;
  }

  public async removeCustomerFeedback(feedbackId: number) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ is_archive: false, id: feedbackId }).update({ is_archive: true });
  }
}