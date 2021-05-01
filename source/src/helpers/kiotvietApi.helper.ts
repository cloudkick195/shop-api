import { Injectable } from "../decorators/injectable.decorator";
import axios from 'axios';
import qs from 'qs'
@Injectable()
export class kiotvietApi {
  async GetProductKiotviet(code: string): Promise<any> {
    const product: any = await axios.get(`${process.env.KIOTVIET_PUBLIC_API}/products/code/${code}`, {
      headers: {
          'Authorization': `Bearer ${process.env.KIOTVIET_ACCESS_TOKEN}`,
          'Retailer': process.env.RETAIL_ID
      }
    })
    
    return product
  }

  async getAccessTokenKiotviet() : Promise<any> {
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

      return res.data.access_token
  } catch (error) {
      return error
  }
  }

  constructor() {}
}