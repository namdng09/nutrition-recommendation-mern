import type { Request, Response } from 'express';

import type { PaymentStatus } from '~/shared/constants/payment-status';
import { ApiResponse } from '~/shared/utils';

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

  getMembershipPaymentByOrderCode: async (req: Request, res: Response) => {
    const orderCode = Number(req.params.orderCode);

    const result =
      await PaymentService.getMembershipPaymentByOrderCode(orderCode);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin thanh toán thành công', result));
  },

  listPaymentsByUser: async (req: Request, res: Response) => {
    const userId = req.params.userId ?? req.user!._id.toString();

    const result = await PaymentService.listPaymentsByUser(userId);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách thanh toán thành công', result));
  },

  listMembershipPayments: async (req: Request, res: Response) => {
    const status = req.query.status as PaymentStatus | undefined;

    const result = await PaymentService.listMembershipPayments(status);

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

    const result = await PaymentService.confirmPayment(orderCode);

    res
      .status(200)
      .json(ApiResponse.success('Xác nhận thanh toán thành công', result));
  }
};
