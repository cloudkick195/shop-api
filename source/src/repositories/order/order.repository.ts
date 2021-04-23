import Knex from "knex";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { DBConnection } from "../../database/connection";

@Injectable()
export class OrderRepository extends BaseRepository implements RepositoryInterface {
  private tableName: string = 'order';
  private primaryKey: string = 'order.order_id';
  fillable: Array<string> = [
    'customer_id',
    'customer_name',
    'customer_phone',
    'ship_payment',
    'ship_type',
    'ship_address',
    'ship_price',
    'ship_date',
    'ship_ward',
    'order_description',
    'discount',
    'order_date',
    'status',
    'tracking_token'
  ];

  public async getListOrders(offset: number = 0, limit: number = 20, keyword: string | null = null): Promise<any> {
    const connector: Knex = this.dbSchema.getConnection();
    let query = connector(this.tableName).select([
      'order.order_id',
      'order.customer_id',
      'order.customer_name',
      'order.customer_phone',
      'order.ship_payment',
      'order.ship_type',
      'order.ship_address',
      'order.ship_price',
      'order.ship_date',
      'order.ship_ward',
      'order.order_description',
      'order.discount',
      'order.order_date',
      'order.status',
      'order.tracking_token',
    ]).count('order_detail.order_detail_id as product_count').where({});
    let queryCount = connector(this.tableName).count('order.order_id as count').first();
    if (keyword) {
      query = query.where('order.customer_name', 'like', `%${keyword}%`);
      queryCount = queryCount.where('order.customer_name', 'like', `%${keyword}%`);
    }
    query = query.leftJoin('order_detail', 'order.order_id', 'order_detail.order_id').groupBy('order.order_id');
    return Promise.all([
      query.offset(offset).limit(limit).orderBy(this.primaryKey, 'desc'),
      queryCount
    ]);
  }

  public async getDetailOrder(orderId: string): Promise<any> {
    const connector: Knex = this.dbSchema.getConnection();
    return connector(this.tableName).select([
      'order.order_id',
      'order.customer_id',
      'order.customer_name',
      'order.customer_phone',
      'order.ship_payment',
      'order.ship_type',
      'order.ship_address',
      'order.ship_price',
      'order.ship_date',
      'order.ship_ward',
      'order.order_description',
      'order.discount',
      'order.order_date',
      'order.status',
      'order.tracking_token',
      'order.total',
    ]).where({ 'order.order_id': orderId }).first();
  }

  constructor(private readonly dbSchema: DBConnection) {
    super();
  }
}