import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { CreateMediaFolderApiModel } from "../../models/media/media-folder/create-media-folder.api-model";
import { MediaRepository } from "../media.repository";
import { DBConnection } from "../../database/connection";
import { Dictionary } from "../../models/common/type.model";

@Injectable()
export class MediaFolderRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['name', 'parent_id', 'is_archive'];
  public fillSelectors: Array<string> = ['id', 'parent_id', 'is_archive'];
  private tableName: string = 'media_folders';

  constructor(
    private dbConnector: DBConnection,
    private mediaRepository: MediaRepository
  ) {
    super();
  }

  public async getMediaFolderWithCondition(condition: Dictionary = {}, isMultiple: boolean = false): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const query = connection(this.tableName).where({ is_archive: false, ...condition }).select(['id', 'name', 'parent_id', 'is_archive']);
    if (!isMultiple) {
      return query.first();
    }
    return query;
  }

  public async createNewMediaFolder(data: CreateMediaFolderApiModel): Promise<any> {
    const connection: Knex = await this.dbConnector.getConnection();
    const [folderId] = await connection(this.tableName).insert(data);
    return this.getMediaFolderWithCondition({ id: folderId });
  }

  public async getMediaFolderDetail(parentId: number, offset: number, limit: number, patchOffset: number = 0): Promise<any> {
    return Promise.all([
      this.getMediaFolderWithCondition({ parent_id: parentId }, true),
      this.mediaRepository.getListMediaByParent(parentId, offset + (+patchOffset), limit - (+patchOffset))
    ]);
  }
}