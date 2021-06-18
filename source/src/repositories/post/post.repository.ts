import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { PoolConnection } from "mysql2/promise";

import { DBConnection } from "../../database/connection";
import Knex from "knex";

@Injectable()
export class PostRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name', 'id_process_image', 'category_id', 
    'slug', 'description', 'summary','created_by', 'archive_by'
  ];
  private tableName: string = 'posts';

  constructor(
    private dbConnector: DBConnection,
  ) {
    super();
  }

  public async createPost(dataPost: any, user: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable(dataPost));

      await t.commit();
      return await this.getPostByKeyValue('post_id', rowInsertId, []);
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error.message);
    }
  }


  public async getPostByKeyValue(key: string, value: string | number, relations: Array<string> = []): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let selectQuery: string = `p.post_id, p.name, p.slug, p.description, p.summary`;
    const params_sql: Array<string | number> = [];
    let joinRelation: string = ``;
    if (relations.includes('image')) {
      selectQuery += ` ,pi.path, pi.version, pi.file_name, pi.resource_type, pi.id_process_image `;
      joinRelation += ` LEFT JOIN process_images pi on p.id_process_image = pi.id_process_image `;
    }
    if (relations.includes('category')) {
      selectQuery += ` ,pc.slug as cat_slug, pc.name as cat_name, pc.post_category_id as cat_id `;
      joinRelation += ` LEFT JOIN post_categories pc on p.category_id = pc.post_category_id`;
    }
    let sql = `SELECT ${selectQuery} FROM posts p ${joinRelation} WHERE p.archive_by IS NULL AND p.${key} = ?`;
    params_sql.push(value);
    const [result] = await connection.raw(sql, params_sql);
    return result;
  }

  public async getListPosts(params: any, count: boolean = false): Promise<Array<any>> {
    const connection: Knex = this.dbConnector.getConnection();
    let queryColumns: string = count ? `COUNT(*) as count` : `
      p.post_id as id,
      p.name,
      p.slug,
      p.summary,
      pc.name as post_category_name,
      pc.slug as post_category_slug,
      pi.path as pi_path, 
      pi.process_key as pi_key, 
      pi.file_name as pi_file_name, 
      pi.driver as pi_driver,
      pi.version as pi_version,
      u.email as user_email,
      u.name as user_name
    `;
    const params_sql = [];
    let sql = `
      SELECT 
        ${queryColumns} 
      FROM posts p
          LEFT OUTER JOIN process_images pi ON pi.id_process_image = p.id_process_image
          LEFT OUTER JOIN users u ON u.id = p.created_by
          LEFT OUTER JOIN post_categories pc ON pc.post_category_id = p.category_id
      WHERE p.archive_by is NULL 
    `;
    if (params.keyword) {
      sql += " AND p.name LIKE ? ";
      params_sql.push(`%${params.keyword}%`);
    }
    if (!count) {
      const orderByKey: string = 'post_id';
      const orderByValue: string = 'DESC';
      if (params.order_by && params.order_by.split('-').length > 1) {
        const [key, value] = params.order_by.split('-');
        sql += ` ORDER BY p.${key} ${value} `
      } else {
        sql += ` ORDER BY p.${orderByKey} ${orderByValue} `
      }
      if (params.page && params.limit) {
        const page: number = parseInt(params.page);
        const limit: number = parseInt(params.limit);
        const offset: number = (page * limit) - limit;
        sql += " LIMIT ?,? ";
        params_sql.push(offset);
        params_sql.push(limit);
      }
    }
    const [result] = await connection.raw(sql, params_sql);
    return result;
  }

  public async removePostBySlug(slug: string, user: { id: number, email: string }): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slug }).update({ archive_by: user.id });
  }

  public async removePostById(Id: string): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    
    return connection(this.tableName).where({ post_id: Id }).del();
  }



  public async getListPostSlides(postId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const sql: string = `
      SELECT 
        ps.post_slide_id AS slide_id,
        ps.link,
        pi.path,
        pi.driver,
        pi.file_name,
        pi.resource_type,
        pi.process_key,
        pi.version,
        pi.id_process_image 
      FROM
        post_slides ps
          LEFT OUTER JOIN
        process_images pi ON pi.id_process_image = ps.id_process_image
      WHERE ps.post_id = ? `;
    const [result] = await connection.raw(sql, [postId]);
    return result;
  }

  public async getDetailPost(postSlug: string): Promise<any> {
    const postDetail: Array<any> = await this.getPostByKeyValue('post_id', postSlug, ['image', 'category']);
    if (postDetail && postDetail[0]) {
      const postId: number = postDetail[0].post_id;
      const result: Array<any> = await Promise.all([
        //this.getListPostSlides(postId),
      ]);
      return [postDetail[0], ...result];
    }
    return [];
  }

  public async updateDataPost(postId: number, dataUpdate: any, userActor: any): Promise<any> {
    let t: Knex.Transaction;

    try {
      const connection: Knex = this.dbConnector.getConnection();
      t = await connection.transaction();
      const { newCombinations, updateCombinations, updateSlides, newSlides, avatar, newEntity, updateEntity, ...postData } = dataUpdate;
      const listQueries: Array<Promise<any>> = [];
      
      if (postData && Object.keys(postData).length > 0) {
        listQueries.push(this.updatePostInformation(postId, postData, t));
      }
      await Promise.all(listQueries);
      await t.commit();
      return true;
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error);
    }
  }

  public async updatePostInformation(postId: number, postData: any, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql_params: Array<any> = [];
    let listKeys: Array<any> = Object.keys(postData);
    let sql: string = `UPDATE posts SET `;
    listKeys.map((key: any, index: number) => {
      if (index !== 0) {
        sql += ',';
      }
      sql += ` ${key}=? `;
      sql_params.push(postData[key]);
    });
    sql += ` WHERE post_id = ? `;
    sql_params.push(postId);
    if (listKeys.length > 0) {
      return connection.raw(sql, sql_params).transacting(transaction);
    }
  }

  public async getPostBySlug(slug: string) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('posts').select(['post_id as id', 'name']).where({ slug }).first();
  }
  public async getPostById(id: string) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('posts').select(['post_id as id', 'name']).where({ id }).first();
  }
}
