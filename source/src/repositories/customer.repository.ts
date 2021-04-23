import Knex from "knex";
import { Injectable } from "../decorators/injectable.decorator";
import { BaseRepository } from "./base.repository";
import { RepositoryInterface } from "../interfaces/repository.interface";
import { CustomerInterface } from "../models/customer/customer.input-api.model";
import { DBConnection } from '../database/connection';

@Injectable()
export class CustomerRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = [
    'customer_id', 'name', 'birth_day', 'gender', 'email', 'password', 'phone', 'phone_temporary',
    'address', 'type'
  ];
  private tableName: string = 'customer';

  public async getCustomerByKeyValue(key: string, value: string | number): Promise<any> {
    const connection: Knex = this.dbSchema.getConnection();
    return connection(this.tableName).select([
      'name',
      'birth_day',    
      'gender',
      'email',
      'phone',
      'address',
      'type',
      'creation_date'
    ]).where({ [key]: value }).first();
  }

  public async getListCustomer(offset: number = 0, limit: number = 20, keyword: string | null = null): Promise<any> {
    const connector: Knex = this.dbSchema.getConnection();
    let query = connector('customer').where({});
    let queryCount = connector('customer').count('customer_id as count').first();
    if (keyword) {
      query = query.where('name', 'like', `%${keyword}%`);
      queryCount = queryCount.where('name', 'like', `%${keyword}%`);
    }
    return Promise.all([
      query.offset(offset).limit(limit).orderBy('customer_id', 'desc'),
      queryCount
    ]);
  }

  public async removeCustomerByEmail(email: string, user: { id: number, email: string }): Promise<any> {
    const connection: Knex = this.dbSchema.getConnection();
    return connection('customer').where({ email }).first().update({ archive_by: user.id });
  }

  public async getDetailCustomer(id: number): Promise<any> {
    const schema = this.dbSchema.getConnection();
    return schema('customer').where({ customer_id: id }).first();
  }

  async findCustomerByEmail(email: string): Promise<any> {
    const connection: Knex = await this.dbSchema.getConnection();
    return connection('customer').select(['customer_id']).where({ email }).first();
  }

  public async updateDataCustomer(email: string, data: Partial<CustomerInterface>): Promise<any> {
    const schema = this.dbSchema.getConnection();
    return schema('customer').where({ email }).first().update(data);
  }

  public async updateCustomerInformation(email: string, customerData: any): Promise<any> {
    const connection = this.dbSchema.getConnection();
    return connection('customer').where({ email }).first().update(customerData);
  }

  public removeCustomerById(customerId: string): Promise<any> {
    const schema: Knex = this.dbSchema.getConnection();
    return schema('customer').where({ customer_id: customerId }).del();
  }

  constructor(
    private readonly dbSchema: DBConnection,
  ) {
    super();
  }
}
