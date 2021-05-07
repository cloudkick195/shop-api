import { Injectable } from "../decorators/injectable.decorator";
import axios from 'axios';
import qs from 'qs';
import { raiseException, responseServer } from "../utils/exceptions/raise.exception";
import { Request, Response } from "express";

@Injectable()
export class KiotvietApi {
  constructor() {
    
  }
  static async getProductKiotviet(code: string): Promise<any> {
    return axios.get(`${process.env.KIOTVIET_PUBLIC_API}/products/code/${code}`, {
      headers: {
          'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
          'Retailer': process.env.RETAIL_NAME
      }
    })
  }
  static async getProductsKiotviet(arrProductCode: any): Promise<any> {
    try {
      const listQuery:any = [];
      arrProductCode.forEach((item:any)=>{
        listQuery.push(
          axios.get(`${process.env.KIOTVIET_PUBLIC_API}/products/code/${item}`, {
            headers: {
                'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
                'Retailer': process.env.RETAIL_NAME
            }
          })
        )
      })
      const results:any = await Promise.all(listQuery);
      return results;
    } catch (error) {
      
      if(error.response && error.response.status == 401){
      
        if(error.response.data.responseStatus.errorCode == 'TokenException'){
          await this.createTokenKiotviet();
          return await this.getProductsKiotviet(arrProductCode);
        }
        
      }

      if(error.response.data.responseStatus.errorCode == 'KvValidateProductException'){
        return {
          error: "Có một sku không tồn tại, không thể đồng bộ"
        };
      }

      return {
        error: "Lỗi không xác định"
      };
      
    }
    
  }

  static async createTokenKiotviet() : Promise<any> {
    try {
      
      const data: any = {
          "client_id": process.env.CLIENT_ID,
          "client_secret": process.env.CLIENT_SECRET,
          "grant_type": process.env.GRANT_TYPE,
          "scopes": process.env.SCOPES,
      }
     
      const res: any = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          }
      })
    
      
      process.env['KIOTVIET_ACCESS_TOKEN'] = res.data.access_token;
    } catch (error) {
      throw error;
    }
  }

  
}