import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { ApiResponse } from '~/shared/utils';
import { payOS } from '~/shared/utils/payos';
import { parseQuery } from '~/shared/utils/query-parser';

import { PaymentService } from './payment-service';

export const PaymentController = {
  createPayment: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await PaymentService.createPayment(data, userId);

    res
      .status(200)
      .json(
        ApiResponse.success('Cập nhật trạng thái thanh toán thành công', result)
      );
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

  getPaymentsHistory: async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const parsed = parseQuery(req.query);

    const result = await PaymentService.getPaymentsHistory(userId, parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy lịch sử thanh toán thành công', result));
  },

  viewPayments: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await PaymentService.viewPayments(parsed);

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
  },

  handleWebhook: async (req: Request, res: Response) => {
    const payload = req.body;

    try {
      await payOS.webhooks.verify(payload);
    } catch {
      throw createHttpError(400, 'Webhook payOS không hợp lệ');
    }

    const result = await PaymentService.handleExpiredWebhook(payload);

    res
      .status(200)
      .json(ApiResponse.success('Nhận webhook payOS thành công', result));
  }
};
