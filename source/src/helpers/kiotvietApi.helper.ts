import { Injectable } from "../decorators/injectable.decorator";
import axios from 'axios';
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

  constructor() {}
}