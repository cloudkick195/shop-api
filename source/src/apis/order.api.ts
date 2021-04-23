import { Request, Response } from 'express';
import { Get } from "../decorators/http-method.decorator";
import { Controller } from "../decorators/controller.decorator";
import { Dictionary } from '../models/common/type.model';
import { raiseException, responseServer } from '../utils/exceptions/raise.exception';
import { OrderRepository } from '../repositories/order/order.repository';
import { AdminAuthenticationMiddleware } from '../middlewares/admin.authenticate.middleware';
import { OrderDetailRepository } from '../repositories/order/oder-detail.repository';

@Controller('/order')
export class OrderApi {
  @Get('', [AdminAuthenticationMiddleware])
  public async getOrders(request: Request, response: Response) {
    try {
      const params: Dictionary<string> = request.query as Dictionary<string>;
      const data: [Array<any>, { count: number }] = await this.orderRepository.getListOrders(parseInt(params.offset), parseInt(params.limit), params.keyword);
      if (data && data[0] && data[0].length > 0) {
        return responseServer(request, response, 200, 'Get list products successfully', {
          results: data[0],
          count: data[1].count,
        });
      }
      return responseServer(request, response, 200, 'Get list orders successfully', [])
    } catch (error) {
      return raiseException(request, response, 500, error.message);
    }
  }
  
  @Get('/:orderId', [AdminAuthenticationMiddleware])
  public async getOrderDetail(request: Request, response: Response) {
    try {
      const { orderId } = request.params;
      const order = await this.orderRepository.getDetailOrder(orderId);
      if (!order || !order.order_id) {
        return raiseException(request, response, 404, 'Can not find any order');
      }
      const orderDetails = await this.orderDetailRepository.getListOrderDetailOfOder(order.order_id);
      let orderDetailData: Array<any> = [];
      if (orderDetails && orderDetails.length > 0) {
        const orderDetailHashMap = orderDetails.reduce((hashMap: Dictionary, orderDetailItem: any) => {
          if (!hashMap[orderDetailItem.order_detail_id]) {
            hashMap[orderDetailItem.order_detail_id] = {
              data: {
                order_detail_id: orderDetailItem.order_detail_id,
                qty: 2,
                product_price: orderDetailItem.product_price,
                product_old_price: orderDetailItem.product_old_price,
                product_name: orderDetailItem.product_name,
                product_option: orderDetailItem.product_name,
                avatar: orderDetailItem.avatar,
              },
              entities: []
            };
          }
          hashMap[orderDetailItem.order_detail_id].entities.push({ name: orderDetailItem.entity_name });
          return hashMap;
        }, {});
        orderDetailData = Object.values(orderDetailHashMap);
      }
      return responseServer(request, response, 200, 'Get order successfully', {
        ...order,
        combinations: orderDetailData,
      })
    } catch (error) {
      console.error(error)
      return raiseException(request, response, 500, 'Fail to get detail order');
    }
  }

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderDetailRepository: OrderDetailRepository,
  ) {}
}