import Knex from 'knex';
import { Injectable } from './../decorators/injectable.decorator';
import { PoolConnection } from 'mysql2/promise';
import { BaseRepository } from './base.repository';
import { RepositoryInterface } from '../interfaces/repository.interface';
import { DBConnection } from '../database/connection';
import { range } from '../helpers/number.helper';

@Injectable()
export class MediaRepository extends BaseRepository implements RepositoryInterface {
  fillable: Array<string> = ['path', 'file_name', 'driver'];

  constructor(private dbConnector: DBConnection) {
    super();
  }

  async createMediaRow(data: Array<any>, driver: number = 3): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      const [result]: any = await connection('process_images').transacting(t).insert(data);
      await t.commit();
      const listIds: Array<number> = range(parseInt(result), parseInt(result) + (data.length - 1));
      const listItemAdded = await this.getListMediaByIds(listIds);
      return listItemAdded.map((item: any) => {
        return {
          id: item.id_process_image,
          process_key: item.process_key,
          path: `${ process.env.CLOUD_IMAGE_PATH }/${ item.path }/v${ item.version }/${ item.file_name }`,
          resource_type: item.resource_type
        }
      });
    } catch (e) {
      if (t) await t.rollback();
      throw new Error(e);
    }
  }

  async getListMediaByIds(listIds: number[]): Promise<any> {
    const connection = this.dbConnector.getConnection();
    return connection('process_images').whereIn('id_process_image', listIds);
  }

  public async getListMediaByParent(parentId: number, offset: number, limit: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection('process_images').select([
      'id_process_image',
      'process_key',
      'path',
      'file_name',
      'driver',
      'folder_id',
      'resource_type',
      'version'
    ]).where({ folder_id: parentId }).orderBy('id_process_image', 'desc').offset(offset).limit(limit);
  }
}
