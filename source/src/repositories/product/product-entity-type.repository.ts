import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { DBConnection } from "../../database/connection";

@Injectable()
export class ProductEntityTypeRepository extends BaseRepository implements RepositoryInterface {
  public fillable: Array<string> = ['entity_id', 'id_process_image', 'product_id'];
  constructor() {
    super();
  }
}
