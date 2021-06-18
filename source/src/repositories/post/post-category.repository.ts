import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { BaseRepository } from "../base.repository";
import { PostCategoryInputApiModel } from "../../models/post-category/input/post-category.model";
import { SortPostCategoryInputApiModel } from '../../models/post-category/input/sort-post-category.input-api.model';
import { DBConnection } from "../../database/connection";

@Injectable()
export class PostCategoryRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name',
    'slug',
    'id_process_image',
    'parent_id',
    'archive_by',
    'created_by',
    'position'
  ];
  private tableName: string = 'post_categories';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async storePostCategory(data: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const currentMaxParent: any = await this.getCurrentMaxPositionOfParentCategory(data.parent_id);
    if (currentMaxParent && currentMaxParent.max >= 0) {
      data.position = currentMaxParent.max + 1;
    } else {
      data.position = 0;
    }
    const [postCategoryId] = await connection(this.tableName).insert(super.composeDataWithFillable(data));
    return await this.findPostCategoryByKey(postCategoryId, 'post_category_id');
  }

  private async getCurrentMaxPositionOfParentCategory(parentId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).max('position as max').where({ parent_id: parentId }).first();
  }

  public async updatePostCategory(id: number, data: Partial<PostCategoryInputApiModel>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ post_category_id: id}).first().update(super.composeDataWithFillable(data));
  }

  public async removePostCategory(slug: string, userId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slug }).first().del();
  }

  public async findPostCategoryByKey(value: number | string, key: string = 'post_category_id', getAvatar: boolean = false, isMultiple: boolean = false): Promise<any> {
    const mediaTable: string = 'process_images';
    const connection: Knex = this.dbConnector.getConnection();
    let query: Knex.QueryBuilder = connection(this.tableName).select([
      `${this.tableName}.post_category_id as id`,
      `${this.tableName}.name`,
      `${this.tableName}.slug`,
      `${this.tableName}.parent_id`,
      `${this.tableName}.position`,
    ]).where({ [`${this.tableName}.${key}`]: value});
    if (getAvatar) {
      query = query.leftJoin(mediaTable, `${mediaTable}.id_process_image`, `${this.tableName}.id_process_image`).select([
        `${mediaTable}.id_process_image`,
        `${mediaTable}.path`,
        `${mediaTable}.file_name`,
        `${mediaTable}.version`,
      ]);
    }
    if (!isMultiple) {
      return query.first();
    }
    return query;
  }

  public async getListPostCategories(params: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let query: Knex.QueryBuilder = connection(this.tableName).select([
      `post_category_id as id`,
      `name`,
      `slug`,
      `parent_id`,
      `position`,
    ]);
    if (params.keyword) {
      query = query.where('name', 'like', `%${params.keyword}%`);
    }
    if (params.parent_id) {
      query = query.where({ parent_id: params.parent_id });
    }
    let orderByKey: string = 'position';
    let orderByValue: string = 'ASC';
    if (params.order_by && params.order_by.split('-').length > 1) {
      const [key, value] = params.order_by.split('-');
      orderByKey = key;
      orderByValue = value;
    }
    return query.orderBy(orderByKey, orderByValue);
  }

  public async getPostCategoryByIds(listIds: Array<number>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql: string = `
      SELECT post_category_id as id,
          pc.name,
          slug,
          position,
          parent_id,
          u.name              as user_name,
          u.email             as user_email,
          u.id                as user_id
      FROM post_categories pc
          LEFT JOIN users u on pc.created_by = u.id
      WHERE pc.post_category_id IN (?) AND u.email_verified_at IS NOT NULL
    `;
    const [result] = await connection.raw(sql, [listIds]);
    return result;
  }

  private async getListPostCategoryInRangePosition(parentId: number, start: number, end: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql: string = `
      SELECT post_category_id, position
      FROM post_categories
      WHERE parent_id = ?
        AND position BETWEEN ? AND ?
      ORDER BY position ASC;
    `;
    const [result] = await connection.raw(sql, [parentId, start, end]);
    return result;
  }

  public async sortPostCategories(dataSort: SortPostCategoryInputApiModel): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      const currentPostCategory: any = await this.findPostCategoryByKey(dataSort.pc_id, 'post_category_id', false);
      if (!currentPostCategory || !currentPostCategory.id) {
        throw new Error("Can't not make any action with this item !");
      }
      const isUpdatePositionToNext: boolean = dataSort.current_index > currentPostCategory.position;
      const dataToUpdateSort: any = [];

      if (isUpdatePositionToNext) {
        const startChangeIndex: number = currentPostCategory.position + 1;
        const data: any = await this.getListPostCategoryInRangePosition(currentPostCategory.parent_id, startChangeIndex, dataSort.current_index);
        data.map((item: any) => {
          dataToUpdateSort.push({
            cat_id: item.post_category_id,
            position: item.position - 1
          });
        });
        dataToUpdateSort.push({
          cat_id: dataSort.pc_id,
          position: dataSort.current_index
        });
      } else {
        const startChangeIndex: number = dataSort.current_index;
        const data: any = await this.getListPostCategoryInRangePosition(currentPostCategory.parent_id, startChangeIndex, currentPostCategory.position - 1);
        data.map((item: any) => {
          dataToUpdateSort.push({
            cat_id: item.post_category_id,
            position: item.position + 1
          });
        });
        dataToUpdateSort.unshift({
          cat_id: dataSort.pc_id,
          position: dataSort.current_index
        });
      }
      let listIdsToUpdate: Array<number> = [];
      let query_params: Array<string | number> = [];
      let sql: string = `
                UPDATE post_categories 
                SET position = CASE 
            `;
      dataToUpdateSort.map((item: { cat_id: number, position: number }) => {
        listIdsToUpdate.push(item.cat_id);
        sql += `
                    WHEN post_category_id = ? THEN ? 
                `;
        query_params.push(item.cat_id);
        query_params.push(item.position);
      });
      sql += `
                END
                WHERE post_category_id IN(?);
            `;
      await connection.raw(sql, [...query_params, listIdsToUpdate]).transacting(t);
      await t.commit();
      return true;
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error.message);
    }
  }
}
