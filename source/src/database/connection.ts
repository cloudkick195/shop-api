import { Injectable } from "../decorators/injectable.decorator";
import dbORM from 'knex';
import Knex from "knex";

@Injectable()
export class DBConnection {
  private connection: Knex = dbORM({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
    },
    pool: {
      min: 0,
      max: 10
    }
  });

  getConnection(): Knex {
    return this.connection;
  }

  constructor() {}
}