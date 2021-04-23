import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { ListSlideInputApiModel } from "../../models/main-slide/list-slide.input-api.model";
import { UpdateSlideInputApiModel } from "../../models/main-slide/update-slide.input-api.model";
import { DBConnection } from "../../database/connection";
import Knex from "knex";

@Injectable({
  providerIn: 'root'
})
export class MainSlideRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['id_process_image', 'link', 'is_archive'];
  private tableName: string = 'main_slides';

  constructor(
    private dbConnector: DBConnection
  ) {
    super();
  }

  public async createMainSlide(data: Array<ListSlideInputApiModel>): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    let t: Knex.Transaction;
    try {
      t = await connection.transaction();
      await connection(this.tableName).transacting(t).insert(data);
      await t.commit();
      return true;
    } catch (e) {
      if (t) await t.rollback();
      throw new Error(e);
    }
  }

  public async updateMainSlide(data: UpdateSlideInputApiModel, slideId: number): Promise<any> {
    const connection = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slide_id: slideId }).first().update(data);
  }

  public async removeMainSlide(slideId: number): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    return connection(this.tableName).where({ slide_id: slideId }).first().update({ is_archive: 1 });
  }

  public async getAllMainSlides(): Promise<any> {
    const connection: Knex = this.dbConnector.getConnection();
    const processImage: string = 'process_images';
    return connection(this.tableName)
      .where({ [`${this.tableName}.is_archive`]: false })
      .leftJoin(processImage, `${processImage}.id_process_image`, `${this.tableName}.id_process_image`)
      .select([
        `${this.tableName}.slide_id AS id`,
        `${this.tableName}.link`,
        `${processImage}.path`,
        `${processImage}.driver`,
        `${processImage}.file_name`,
        `${processImage}.process_key`,
        `${processImage}.version`
      ])
  }

  public async updateListMainSlide(mainSlideUpdateData: any): Promise<any> {
    try {
      const connection: Knex = this.dbConnector.getConnection();
      const dataStructure: any = {
        process_image: [],
        link: []
      };
      const dataMapping: any = {
        process_image: [],
        link: []
      };
      const listIds: Array<number> = [];
      const queryLists: Array<string> = [];
      mainSlideUpdateData.map((item: any, index: number) => {
        if (item && item.id && item.id > 0) {
          listIds.push(item.id);
          if ('process_image' in item) {
            if (index === 0) {
              dataStructure.process_image.push(` id_process_image = CASE slide_id  `);
            }
            dataStructure.process_image.push(` WHEN ${item.id} THEN ? `);
            dataMapping.process_image.push(item.process_image);
          }
          if ('link' in item) {
            if (index === 0) {
              dataStructure.link.push(` link = CASE slide_id  `);
            }
            dataStructure.link.push(` WHEN ${item.id} THEN ? `);
            dataMapping.link.push(item.link);
          }
        }
      });
      Object.keys(dataStructure).map((item: any) => {
        if (item && dataStructure[item] && dataStructure[item].length > 0) {
          queryLists.push(dataStructure[item].join(""));
        }
      });
      let sql: string = `
                UPDATE main_slides SET 
                    ${queryLists.join("  END, ")} END
                WHERE slide_id IN (${listIds.join()}) AND is_archive IS FALSE;
            `;
      if (dataStructure.process_image.length > 0 || dataStructure.link.length > 0) {
        const [result] = await connection.raw(sql, [...dataMapping.process_image, ...dataMapping.link]);
        return result;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}