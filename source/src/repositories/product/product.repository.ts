import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { PoolConnection } from "mysql2/promise";
import { ProductCombinationRepository } from "./product-combination.repository";
import { ProductSlideRepository } from "./product-slide.repository";
import { ProductEntityBackgroundRepository } from "./product-entity-background.repository";
import { DBConnection } from "../../database/connection";
import Knex from "knex";

@Injectable()
export class ProductRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'name', 'id_process_image', 'category_id', 'count',
    'slug', 'price', 'price_sale', 'sku', 'description', 'created_by', 'archive_by'
  ];
  private tableName: string = 'products';

  constructor(
    private dbConnector: DBConnection,
    private productCombinationRepository: ProductCombinationRepository,
    private productSlideRepository: ProductSlideRepository,
    private productEntityBackgroundRepository: ProductEntityBackgroundRepository
  ) {
    super();
  }

  public async createProduct(dataProduct: any, user: any): Promise<any> {
    console.log('******** dataProduct **********: ', dataProduct);
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      const [rowInsertId] = await connection(this.tableName).insert(super.composeDataWithFillable(dataProduct));
      const listQueryRelations: Array<Promise<any>> = [];
      if (rowInsertId) {
        if (dataProduct.combinations && dataProduct.combinations.length > 0) {
          listQueryRelations.push(this.productCombinationRepository.prepareAndCreateCombinationForProduct(rowInsertId, dataProduct.combinations, false, t));
        }
        if (dataProduct.slides && dataProduct.slides.length > 0) {
          listQueryRelations.push(this.createProductSliders(rowInsertId, dataProduct.slides, t));
        }
        if (dataProduct.entity && dataProduct.entity.length > 0) {
          listQueryRelations.push(this.productEntityBackgroundRepository.createProductEntityBackground(rowInsertId, dataProduct.entity, t));
        }
      }
      if (listQueryRelations && listQueryRelations.length > 0) {
        await Promise.all(listQueryRelations);
      }
      await t.commit();
      return await this.getProductByKeyValue('product_id', rowInsertId, []);
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error.message);
    }
  }

  private async createProductSliders(productId: number, sliderData: Array<any>, transaction: Knex.Transaction): Promise<any> {
    const dataSliders: Array<any> = sliderData.map((item: any) => {
      return {
        product_id: productId,
        id_process_image: item.process_image,
        link: item.link
      }
    });
    return await this.productSlideRepository.createListSlideForProduct(dataSliders, transaction);
  }

  public async getProductByKeyValue(key: string, value: string | number, relations: Array<string> = []): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let selectQuery: string = `p.product_id, p.name, p.slug, p.price, p.price_sale, p.sku, p.description`;
    const params_sql: Array<string | number> = [];
    let joinRelation: string = ``;
    if (relations.includes('image')) {
      selectQuery += ` ,pi.path, pi.version, pi.file_name, pi.resource_type, pi.id_process_image `;
      joinRelation += ` LEFT JOIN process_images pi on p.id_process_image = pi.id_process_image `;
    }
    if (relations.includes('category')) {
      selectQuery += ` ,pc.slug as cat_slug, pc.name as cat_name, pc.product_category_id as cat_id `;
      joinRelation += ` LEFT JOIN product_categories pc on p.category_id = pc.product_category_id and pc.is_archive IS FALSE `;
    }
    let sql = `SELECT ${selectQuery} FROM products p ${joinRelation} WHERE p.archive_by IS NULL AND p.${key} = ?`;
    params_sql.push(value);
    const [result] = await connection.raw(sql, params_sql);
    return result;
  }

  public async getListProducts(params: any, count: boolean = false): Promise<Array<any>> {
    const connection: Knex = this.dbConnector.getConnection();
    let queryColumns: string = count ? `COUNT(*) as count` : `
      p.product_id as id,
      p.name,
      p.slug,
      p.price,
      p.price_sale,
      p.sku,
      pc.name as product_category_name,
      pc.slug as product_category_slug,
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
      FROM products p
          LEFT OUTER JOIN process_images pi ON pi.id_process_image = p.id_process_image
          LEFT OUTER JOIN users u ON u.id = p.created_by
          LEFT OUTER JOIN product_categories pc ON pc.product_category_id = p.category_id
      WHERE p.archive_by is NULL 
    `;
    if (params.keyword) {
      sql += " AND p.name LIKE ? ";
      params_sql.push(`%${params.keyword}%`);
    }
    if (!count) {
      const orderByKey: string = 'product_id';
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

  public async removeProductBySlug(slug: string, user: { id: number, email: string }): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slug }).update({ archive_by: user.id });
  }

  public async getListCombinationOfProduct(productId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const sql = `
      SELECT 
        pac.combination_id,
        pac.count AS totalCount,
        aet.attr_id,
        aet.id_entity_type as entity_id,
        aet.entity_name
      FROM
        product_attribute_combinations pac
          LEFT OUTER JOIN
        product_attribute_entity_combinations paec ON paec.combination_id = pac.combination_id
          LEFT OUTER JOIN
        attr_entity_type aet ON aet.id_entity_type = paec.entity_id
          AND aet.is_archive IS FALSE
      WHERE
          pac.is_archive IS FALSE
              AND pac.product_id = ?
    `;
    const [result] = await connection.raw(sql, [productId]);
    return result;
  }

  public async getListProductSlides(productId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const sql: string = `
      SELECT 
        ps.product_slide_id AS slide_id,
        ps.link,
        pi.path,
        pi.driver,
        pi.file_name,
        pi.resource_type,
        pi.process_key,
        pi.version,
        pi.id_process_image 
      FROM
        product_slides ps
          LEFT OUTER JOIN
        process_images pi ON pi.id_process_image = ps.id_process_image
      WHERE ps.is_archive IS FALSE AND ps.product_id = ? `;
    const [result] = await connection.raw(sql, [productId]);
    return result;
  }

  public async getListProductWholeSale(productId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const sql: string = `
      SELECT 
        id, min_qty, discount
      FROM
        product_whole_sale
      WHERE
        archive_by IS NULL AND product_id = ?;
    `;
    const [result] = await connection.raw(sql, [productId]);
    return result;
  }

  public async getDetailProduct(productSlug: string): Promise<any> {
    const productDetail: Array<any> = await this.getProductByKeyValue('slug', productSlug, ['image', 'category']);
    if (productDetail && productDetail[0]) {
      const productId: number = productDetail[0].product_id;
      const result: Array<any> = await Promise.all([
        this.getListCombinationOfProduct(productId),
        this.getListProductSlides(productId),
        this.productEntityBackgroundRepository.getListEntityBackground(productId),
      ]);
      return [productDetail[0], ...result];
    }
    return [];
  }

  public async updateDataProduct(productId: number, dataUpdate: any, userActor: any): Promise<any> {
    let t: Knex.Transaction;
    try {
      const connection: Knex = this.dbConnector.getConnection();
      t = await connection.transaction();
      const { newCombinations, updateCombinations, updateSlides, newSlides, avatar, newEntity, updateEntity, ...productData } = dataUpdate;
      const listQueries: Array<Promise<any>> = [];
      if (newCombinations && newCombinations.length > 0) {
        listQueries.push(this.productCombinationRepository.prepareAndCreateCombinationForProduct(productId, dataUpdate.newCombinations, false, t));
      }
      if (updateCombinations && updateCombinations.length > 0) {
        listQueries.push(this.productCombinationRepository.updateListCombinationId(productId, dataUpdate.updateCombinations, t));
      }
      if (updateSlides && updateSlides.length > 0) {
        listQueries.push(this.productSlideRepository.actionUpdateProductSlides(productId, updateSlides, t));
      }
      if (newSlides && newSlides.length > 0) {
        const dataCreateSlides = newSlides.map((slideItem: any) => {
          return {
            product_id: productId,
            id_process_image: slideItem.process_image,
            link: slideItem.link
          };
        });
        listQueries.push(this.productSlideRepository.createListSlideForProduct(dataCreateSlides, t));
      }
      if (newEntity && newEntity.length > 0) {
        const dataCreateEntity = newEntity.map((entityItem: any) => ({
          entity_id: entityItem.entity_id,
          image: entityItem.image, 
        }));
        listQueries.push(this.productEntityBackgroundRepository.createProductEntityBackground(productId, dataCreateEntity, t));
      }
      if (updateEntity && updateEntity.length > 0) {
        listQueries.push(this.productEntityBackgroundRepository.updateListProductEntityBackground(productId, updateEntity, t));
      }
      if (productData && Object.keys(productData).length > 0) {
        listQueries.push(this.updateProductInformation(productId, productData, t));
      }
      await Promise.all(listQueries);
      await t.commit();
      return true;
    } catch (error) {
      if (t) await t.rollback();
      throw new Error(error);
    }
  }

  public async updateProductInformation(productId: number, productData: any, transaction: Knex.Transaction): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let sql_params: Array<any> = [];
    let listKeys: Array<any> = Object.keys(productData);
    let sql: string = `UPDATE products SET `;
    listKeys.map((key: any, index: number) => {
      if (index !== 0) {
        sql += ',';
      }
      sql += ` ${key}=? `;
      sql_params.push(productData[key]);
    });
    sql += ` WHERE product_id = ? `;
    sql_params.push(productId);
    if (listKeys.length > 0) {
      return connection.raw(sql, sql_params).transacting(transaction);
    }
  }

  public async getProductBySlug(slug: string) {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('products').select(['product_id as id', 'name']).where({ slug }).first();
  }
}
