import Knex from "knex";
import { Injectable } from "../decorators/injectable.decorator";
import { compareSync } from 'bcryptjs';
import { DBConnection } from "../database/connection";

@Injectable()
export class UserRepository {
    private tableName: string = 'users';

    async findUserById(id: number): Promise<any> {
        const connection: Knex = await this.dbConnector.getConnection();
        return connection(this.tableName).where({ id }).first();
    }

    async findUserByEmail(email: string): Promise<any> {
        const connection: Knex = await this.dbConnector.getConnection();
        return connection(this.tableName).where({ email }).first();
    }

    public comparePasswordUser(password: string, hash: string): boolean {
        return compareSync(password, hash);
    }

    constructor(private readonly dbConnector: DBConnection) { }
}