import Knex from "knex";
import { Injectable } from "../../decorators/injectable.decorator";
import { BaseRepository } from "../base.repository";
import { RepositoryInterface } from "../../interfaces/repository.interface";
import { CreatePolicyPostApiModel } from "../../models/policy-post/create-policy-post.api-model";
import { PolicyPostEntity } from "../../models/policy-post/entity/policy-post-entity";
import { DBConnection } from "../../database/connection";
import { Dictionary } from "../../models/common/type.model";

@Injectable()
export class PolicyPostRepository extends BaseRepository implements RepositoryInterface {
	public fillable: Array<string> = ['post_slug', 'post_content', 'post_name', 'is_archive'];
	private tableName: string = 'policy_posts';

	constructor(
		private dbConnector: DBConnection
	) {
		super();
	}

	public async createNewPolicyPost(newPolicyPost: CreatePolicyPostApiModel): Promise<PolicyPostEntity[]> {
		const connection: Knex = await this.dbConnector.getConnection();
		const [policyPost] = await connection(this.tableName).insert({ post_slug: newPolicyPost.post_slug, post_content: newPolicyPost.post_content, post_name: newPolicyPost.post_name });
		return this.getPolicyPostByCondition({ post_id: policyPost });
	}

	public async getPolicyPostByCondition(condition: Dictionary = {}, isMultiple: boolean = false): Promise<any> {
		const connection: Knex = this.dbConnector.getConnection();
		const query: Knex.QueryBuilder = connection(this.tableName).select([
			'post_name',
			'post_slug',
			'post_content',
			'is_archive',
			'post_id',
		]).where(condition);
		if (!isMultiple) {
			return query.first();
		}
		return query;
	}

	public async getListPolicyPost(params: any, count: boolean = false): Promise<any> {
		const connection: Knex = this.dbConnector.getConnection();
		let query = connection(this.tableName).select([
			'post_slug', 'post_content', 'post_name', 'post_id'
		]).where({ is_archive: false });
		let queryCount = connection(this.tableName).count('post_id as count').where({ is_archive: false }).first();
		if (params.keyword) {
			query = query.where('post_name', 'like', `%${params.keyword}%`);
			queryCount = queryCount.where('post_name', 'like', `%${params.keyword}%`);
		}
		let orderByKey: string = 'post_id';
		let orderByValue: string = 'DESC';
		if (params.order_by && params.order_by.split('-').length > 1) {
			const [key, value] = params.order_by.split('-');
			orderByKey = key;
			orderByValue = value;
		}
		query = query.orderBy(orderByKey, orderByValue);
		return Promise.all([
			query,
			queryCount,
		])
	}

	public async removePolicyPostById(policyPostId: number): Promise<any> {
		const condition: Knex = this.dbConnector.getConnection();
		return condition(this.tableName).where({ post_id: policyPostId }).first().update({ is_archive: true });
	}

	public async updatePolicyPost(policyPostId: number, dataUpdate: any): Promise<any> {
		const connection: Knex = this.dbConnector.getConnection();
		let params_sql: Array<any> = [];
		let columnsUpdate: string = "";
		let sql: string = `
			UPDATE policy_posts SET
		`;
		Object.keys(dataUpdate).map((key: string, index: number) => {
			if (this.fillable.includes(key)) {
				if (columnsUpdate && columnsUpdate != '') {
					columnsUpdate += ",";
				}
				columnsUpdate += ` ${key} = ? `;
				params_sql.push(dataUpdate[key])
			}
		});
		sql += columnsUpdate;
		sql += " WHERE is_archive IS FALSE AND post_id = ?";
		params_sql.push(policyPostId);
		if (params_sql.length && columnsUpdate) {
			const [result] = await connection.raw(sql, params_sql);
			return result;
		}
	}
}
