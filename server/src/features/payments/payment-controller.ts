import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { PaymentService } from './payment-service';

export const PaymentController = {
  createPayment: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await PaymentService.createPayment(data, userId);

    return res.redirect(result);
  },

  updatePaymentStatus: async (req: Request, res: Response) => {
    const orderCode = Number(req.params.orderCode);
    const data = req.body;

    const result = await PaymentService.updatePaymentStatus({
      orderCode,
      ...data
    });

    res
      .status(200)
      .json(
        ApiResponse.success('Cập nhật trạng thái thanh toán thành công', result)
      );
  },

  getPaymentByOrderCode: async (req: Request, res: Response) => {
    const orderCode = Number(req.params.orderCode);

    const result = await PaymentService.getPaymentByOrderCode(orderCode);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin thanh toán thành công', result));
  },

  listPaymentsByUser: async (req: Request, res: Response) => {
    const userId = req.params.userId ?? req.user!._id.toString();
    const parsed = parseQuery(req.query);

    const result = await PaymentService.listPaymentsByUser(userId, parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách thanh toán thành công', result));
  },

  listPayments: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await PaymentService.listPayments(parsed);

    res
      .status(200)
      .json(
        ApiResponse.success(
          'Lấy danh sách thanh toán thành viên thành công',
          result
        )
      );
  },

  confirmPayment: async (req: Request, res: Response) => {
    const orderCode = Number(req.query.orderCode);
    const userId = req.user!._id.toString();

    const result = await PaymentService.confirmPayment(orderCode, userId);

    res
      .status(200)
      .json(ApiResponse.success('Xác nhận thanh toán thành công', result));
  }
};
