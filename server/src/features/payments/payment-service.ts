import {
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse
} from '@payos/node';
import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { PaginateResult } from 'mongoose';

import {
  getDailyTokenLimit,
  getNextQuotaResetAt
} from '~/shared/config/ai-quota';
import type { MembershipLevel } from '~/shared/constants/membership-level';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';
import { UserModel } from '~/shared/database/models';
import type { Payment } from '~/shared/database/models/payment-model';
import { PaymentModel } from '~/shared/database/models/payment-model';
import { buildPaginateOptions } from '~/shared/utils';
import { sendMail } from '~/shared/utils/email/mailer';
import { payOS } from '~/shared/utils/payos';

import {
  CreatePaymentRequest,
  PayOSWebhookRequest,
  UpdatePaymentStatusRequest
} from './payment-dto';

const applyMembershipUpgrade = async (
  payment: InstanceType<typeof PaymentModel>,
  targetMembership: MembershipLevel
) => {
  const user = await UserModel.findById(payment.user);
  if (!user) {
    throw createHttpError(404, 'Người dùng không tồn tại');
  }

  user.membershipLevel = targetMembership;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  user.membershipExpiresAt = expiresAt;

  const dailyTokenLimit = getDailyTokenLimit(targetMembership);
  user.aiDailyTokenLimit = dailyTokenLimit;
  user.aiQuotaResetAt = getNextQuotaResetAt();

  const currentTokens = Number.isFinite(user.aiTokens)
    ? Number(user.aiTokens)
    : 0;
  user.aiTokens =
    targetMembership === MEMBERSHIP_LEVEL.VIP
      ? Math.max(currentTokens, dailyTokenLimit)
      : Math.min(currentTokens, dailyTokenLimit);

  await user.save();

  sendMail({
    to: user.email,
    subject: `Chúc mừng! Bạn đã nâng cấp lên ${targetMembership}`,
    template: 'membership-upgrade',
    templateData: {
      name: user.name,
      targetMembership,
      orderCode: payment.orderCode.toString(),
      amount: payment.amount.toLocaleString('vi-VN'),
      activationDate: new Date().toLocaleDateString('vi-VN')
    }
  });
};

export const PaymentService = {
  handleExpiredWebhook: async (payload: PayOSWebhookRequest) => {
    const orderCode = payload.data.orderCode;

    const payment = await PaymentModel.findOne({ orderCode });

    if (!payment) {
      return {
        orderCode,
        processed: false,
        reason: 'PAYMENT_NOT_FOUND'
      };
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return {
        orderCode,
        processed: false,
        reason: 'ALREADY_FINALIZED',
        status: payment.status
      };
    }

    const paymentLink = await payOS.paymentRequests.get(orderCode);

    if (paymentLink.status !== 'EXPIRED') {
      return {
        orderCode,
        processed: false,
        reason: 'NOT_EXPIRED',
        payOSStatus: paymentLink.status
      };
    }

    payment.status = PAYMENT_STATUS.CANCELLED;
    payment.cancellationReason = 'Link thanh toán đã hết hạn';
    payment.completedAt = undefined;

    await payment.save();

    return {
      orderCode,
      processed: true,
      status: payment.status,
      payOSStatus: paymentLink.status
    };
  },

  createPayment: async (data: CreatePaymentRequest, userId: string) => {
    // Validate targetMembership if provided
    if (data.targetMembership) {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw createHttpError(404, 'Người dùng không tồn tại');
      }

      const currentMembership = user.membershipLevel || MEMBERSHIP_LEVEL.NORMAL;

      if (currentMembership === data.targetMembership) {
        throw createHttpError(
          400,
          `Bạn đã là thành viên ${data.targetMembership}`
        );
      }

      if (
        currentMembership === MEMBERSHIP_LEVEL.VIP &&
        data.targetMembership === MEMBERSHIP_LEVEL.NORMAL
      ) {
        throw createHttpError(
          400,
          'Không thể hạ cấp từ VIP xuống tài khoản thường'
        );
      }
    }

    const existingPendingPayment = await PaymentModel.findOne({
      user: userId,
      status: PAYMENT_STATUS.PENDING,
      targetMembership: { $exists: true }
    });
    if (existingPendingPayment) {
      throw createHttpError(
        409,
        'Bạn đang có giao dịch chờ thanh toán. Vui lòng hoàn tất hoặc hủy giao dịch hiện tại trước khi tạo giao dịch mới.'
      );
    }

    const orderCode = generateOrderCode();

    const existingPayment = await PaymentModel.findOne({ orderCode });
    if (existingPayment) {
      throw createHttpError(409, 'Mã đơn hàng đã tồn tại, vui lòng thử lại');
    }

    const paymentLinkData: CreatePaymentLinkRequest = {
      orderCode,
      amount: data.amount,
      description: data.description,
      items: [
        {
          name: data.description,
          quantity: 1,
          price: data.amount
        }
      ],
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      expiredAt: Math.floor((Date.now() + 1 * 60 * 1000) / 1000)
    };

    const paymentLinkResponse: CreatePaymentLinkResponse =
      await payOS.paymentRequests.create(paymentLinkData);

    const payment = await PaymentModel.create({
      user: userId,
      orderCode: paymentLinkResponse.orderCode,
      amount: data.amount,
      status: PAYMENT_STATUS.PENDING,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
      targetMembership: data.targetMembership
    });

    return payment.checkoutUrl;
  },

  updatePaymentStatus: async (data: UpdatePaymentStatusRequest) => {
    const payment = await PaymentModel.findOne({
      orderCode: data.orderCode
    }).populate({
      path: 'user',
      select: 'membershipLevel name email'
    });

    if (!payment || !payment.targetMembership) {
      throw createHttpError(
        404,
        'Không tìm thấy giao dịch với orderCode đã cho'
      );
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw createHttpError(
        400,
        'Giao dịch này đã được xử lý và không thể thay đổi trạng thái'
      );
    }

    payment.status = data.status;

    if (data.status === PAYMENT_STATUS.COMPLETED) {
      payment.completedAt = new Date();
      payment.cancellationReason = undefined;

      await applyMembershipUpgrade(
        payment,
        payment.targetMembership as MembershipLevel
      );

      // Close the PayOS link so the user cannot pay it again after manual completion
      await payOS.paymentRequests.cancel(
        payment.orderCode,
        'Đã xác nhận thủ công bởi admin'
      );
    } else if (data.status === PAYMENT_STATUS.CANCELLED) {
      const reason = data.cancellationReason?.trim();
      payment.cancellationReason = reason;
      payment.completedAt = undefined;

      // Cancel the PayOS payment link so the user can no longer pay it
      await payOS.paymentRequests.cancel(payment.orderCode, reason);
    }

    await payment.save();
    await payment.populate({
      path: 'user',
      select: 'name email membershipLevel'
    });
    return payment;
  },

  getPaymentsHistory: async (userId: string, parsed: QueryOptions) => {
    const options = buildPaginateOptions(parsed);
    const filter = {
      ...parsed.filter,
      user: userId
    };

    const result = await PaymentModel.paginate(filter, {
      ...options,
      populate: { path: 'user', select: 'name email membershipLevel' }
    });

    return result;
  },

  viewPayments: async (
    parsed: QueryOptions
  ): Promise<PaginateResult<Payment>> => {
    const options = buildPaginateOptions(parsed);
    const filter = {
      ...parsed.filter,
      targetMembership: { $exists: true }
    };

    const result = await PaymentModel.paginate(filter, {
      ...options,
      populate: { path: 'user', select: 'name email membershipLevel' }
    });

    return result;
  },

  confirmPayment: async (orderCode: number, userId: string) => {
    const payment = await PaymentModel.findOne({ orderCode });
    if (!payment) {
      throw createHttpError(404, 'Không tìm thấy giao dịch');
    }

    if (payment.user?.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền xác nhận giao dịch này');
    }

    // Already finalized — return current state, no double processing
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return payment;
    }

    // Query PayOS for the real payment status
    const paymentLink = await payOS.paymentRequests.get(orderCode);

    if (paymentLink.status === 'PAID') {
      payment.status = PAYMENT_STATUS.COMPLETED;
      payment.completedAt = new Date();
      payment.cancellationReason = undefined;

      if (payment.targetMembership) {
        await applyMembershipUpgrade(payment, payment.targetMembership);
      }
    } else if (
      paymentLink.status === 'CANCELLED' ||
      paymentLink.status === 'FAILED' ||
      paymentLink.status === 'EXPIRED'
    ) {
      payment.status = PAYMENT_STATUS.CANCELLED;
      payment.cancellationReason =
        paymentLink.status === 'EXPIRED'
          ? 'Link thanh toán đã hết hạn'
          : 'Thanh toán đã bị hủy hoặc thất bại';
      payment.completedAt = undefined;
    } else {
      throw createHttpError(400, 'Thanh toán chưa hoàn tất');
    }

    await payment.save();
    return payment;
  }
};

const generateOrderCode = (): number => {
  const millis = Date.now().toString();
  const suffix = millis.slice(-9);
  return Number(`9${suffix}`);
};
