import Knex from "knex";
import { DBConnection } from "../../database/connection";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";

@Injectable()
export class OrderDetailRepository extends BaseRepository implements RepositoryInterface {
  fillable: Array<string> = [
    'order_detail_id',
    'order_id',
    'product_id',
    'combination_id',
    'qty',
    'product_price',
    'product_old_price',
    'product_name',
    'product_option',
    'avatar',
  ];

  public async getListOrderDetailOfOder(orderId: string): Promise<any> {
    const connector: Knex = this.dbSchema.getConnection();
    return connector('order_detail')
            .select([
              'order_detail.order_detail_id',
              'order_detail.product_id',
              'order_detail.combination_id',
              'order_detail.qty',
              'order_detail.product_price',
              'order_detail.product_old_price',
              'order_detail.product_name',
              'order_detail.product_option',
              'order_detail.avatar',
              'attr_entity_type.entity_name',
            ])
            .where({ 'order_id': orderId })
            .leftJoin('product_attribute_entity_combinations', 'product_attribute_entity_combinations.combination_id', 'order_detail.combination_id')
            .leftJoin('attr_entity_type', 'attr_entity_type.id_entity_type', 'product_attribute_entity_combinations.entity_id');
  }

  constructor(
    private readonly dbSchema: DBConnection
  ) {
    super();
  }
}