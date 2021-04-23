import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { BaseRepository } from "../base.repository";
import { ProductCategoryInputApiModel } from "../../models/product-category/input/product-category.model";
import { SortProductCategoryInputApiModel } from '../../models/product-category/input/sort-product-category.input-api.model';
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductCategoryRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name',
    'slug',
    'id_process_image',
    'parent_id',
    'id_archive',
    'archive_by',
    'is_archive',
    'created_by',
    'position',
    'is_show_in_home'
  ];
  private tableName: string = 'product_categories';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async storeProductCategory(data: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const currentMaxParent: any = await this.getCurrentMaxPositionOfParentCategory(data.parent_id);
    if (currentMaxParent && currentMaxParent.max >= 0) {
      data.position = currentMaxParent.max + 1;
    } else {
      data.position = 0;
    }
    const [productCategoryId] = await connection(this.tableName).insert(super.composeDataWithFillable(data));
    return await this.findProductCategoryByKey(productCategoryId, 'product_category_id');
  }

  private async getCurrentMaxPositionOfParentCategory(parentId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).max('position as max').where({ parent_id: parentId }).first();
  }

  public async updateProductCategory(id: number, data: Partial<ProductCategoryInputApiModel>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ product_category_id: id, is_archive: false }).first().update(super.composeDataWithFillable(data));
  }

  public async removeProductCategory(slug: string, userId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slug }).first().update({ is_archive: true });
  }

  public async findProductCategoryByKey(value: number | string, key: string = 'product_category_id', getAvatar: boolean = false, isMultiple: boolean = false): Promise<any> {
    const mediaTable: string = 'process_images';
    const connection: Knex = this.dbConnector.getConnection();
    let query: Knex.QueryBuilder = connection(this.tableName).select([
      `${this.tableName}.product_category_id as id`,
      `${this.tableName}.name`,
      `${this.tableName}.slug`,
      `${this.tableName}.parent_id`,
      `${this.tableName}.position`,
      `${this.tableName}.is_archive`,
      `${this.tableName}.is_show_in_home`
    ]).where({ [`${this.tableName}.${key}`]: value, [`${this.tableName}.is_archive`]: false });
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

  public async getListProductCategories(params: any): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let query: Knex.QueryBuilder = connection(this.tableName).select([
      `product_category_id as id`,
      `name`,
      `slug`,
      `parent_id`,
      `position`,
      `is_archive`,
      `is_show_in_home`
    ]).where({ is_archive: false });
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

  public async getProductCategoryByIds(listIds: Array<number>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql: string = `
      SELECT product_category_id as id,
          pc.name,
          slug,
          position,
          parent_id,
          is_archive,
          u.name              as user_name,
          u.email             as user_email,
          u.id                as user_id,
          is_show_in_home
      FROM product_categories pc
          LEFT JOIN users u on pc.created_by = u.id
      WHERE pc.product_category_id IN (?) AND u.email_verified_at IS NOT NULL AND pc.is_archive is FALSE
    `;
    const [result] = await connection.raw(sql, [listIds]);
    return result;
  }

  private async getListProductCategoryInRangePosition(parentId: number, start: number, end: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql: string = `
      SELECT product_category_id, position
      FROM product_categories
      WHERE parent_id = ?
        AND position BETWEEN ? AND ?
        AND is_archive is FALSE
      ORDER BY position ASC;
    `;
    const [result] = await connection.raw(sql, [parentId, start, end]);
    return result;
  }

  public async sortProductCategories(dataSort: SortProductCategoryInputApiModel): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      const currentProductCategory: any = await this.findProductCategoryByKey(dataSort.pc_id, 'product_category_id', false);
      if (!currentProductCategory || !currentProductCategory.id) {
        throw new Error("Can't not make any action with this item !");
      }
      const isUpdatePositionToNext: boolean = dataSort.current_index > currentProductCategory.position;
      const dataToUpdateSort: any = [];

      if (isUpdatePositionToNext) {
        const startChangeIndex: number = currentProductCategory.position + 1;
        const data: any = await this.getListProductCategoryInRangePosition(currentProductCategory.parent_id, startChangeIndex, dataSort.current_index);
        data.map((item: any) => {
          dataToUpdateSort.push({
            cat_id: item.product_category_id,
            position: item.position - 1
          });
        });
        dataToUpdateSort.push({
          cat_id: dataSort.pc_id,
          position: dataSort.current_index
        });
      } else {
        const startChangeIndex: number = dataSort.current_index;
        const data: any = await this.getListProductCategoryInRangePosition(currentProductCategory.parent_id, startChangeIndex, currentProductCategory.position - 1);
        data.map((item: any) => {
          dataToUpdateSort.push({
            cat_id: item.product_category_id,
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
                UPDATE product_categories 
                SET position = CASE 
            `;
      dataToUpdateSort.map((item: { cat_id: number, position: number }) => {
        listIdsToUpdate.push(item.cat_id);
        sql += `
                    WHEN product_category_id = ? THEN ? 
                `;
        query_params.push(item.cat_id);
        query_params.push(item.position);
      });
      sql += `
                END
                WHERE product_category_id IN(?);
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
