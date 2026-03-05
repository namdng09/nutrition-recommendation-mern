import {
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse
} from '@payos/node';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

import type { MembershipLevel } from '~/shared/constants/membership-level';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import type { PaymentStatus } from '~/shared/constants/payment-status';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';
import { UserModel } from '~/shared/database/models';
import { PaymentModel } from '~/shared/database/models/payment-model';
import { sendMail } from '~/shared/utils/email/mailer';
import { payOS } from '~/shared/utils/payos';

import {
  CreatePaymentRequest,
  UpdatePaymentStatusRequest
} from './payment-dto';

const VIP_AI_TOKENS = 100;

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

  if (targetMembership === MEMBERSHIP_LEVEL.VIP) {
    user.aiTokens = (user.aiTokens ?? 0) + VIP_AI_TOKENS;
  }

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
      cancelUrl: data.cancelUrl
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
    } else if (data.status === PAYMENT_STATUS.CANCELLED) {
      payment.cancellationReason = data.cancellationReason?.trim();
      payment.completedAt = undefined;
    }

    await payment.save();
    await payment.populate({
      path: 'user',
      select: 'name email membershipLevel'
    });
    return payment;
  },

  getMembershipPaymentByOrderCode: async (orderCode: number) => {
    if (!Number.isFinite(orderCode) || orderCode <= 0) {
      throw createHttpError(400, 'orderCode must be a positive number');
    }

    const payment = await PaymentModel.findOne({
      orderCode,
      targetMembership: { $exists: true }
    }).populate({
      path: 'user',
      select: 'name email membershipLevel'
    });

    if (!payment) {
      throw createHttpError(404, 'Membership payment not found');
    }

    return payment;
  },

  listPaymentsByUser: async (userId: string) => {
    const trimmedUserId = typeof userId === 'string' ? userId.trim() : '';
    if (!trimmedUserId || !Types.ObjectId.isValid(trimmedUserId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    return PaymentModel.find({
      user: new Types.ObjectId(trimmedUserId)
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name email membershipLevel'
      });
  },

  listMembershipPayments: async (status?: PaymentStatus) => {
    const filter: Record<string, unknown> = {
      targetMembership: { $exists: true }
    };

    if (status) {
      filter.status = status;
    }

    return PaymentModel.find(filter).sort({ createdAt: -1 }).populate({
      path: 'user',
      select: 'name email membershipLevel'
    });
  },

  confirmPayment: async (orderCode: number) => {
    const payment = await PaymentModel.findOne({ orderCode });
    if (!payment) {
      throw createHttpError(404, 'Không tìm thấy giao dịch');
    }

    // Already finalized — return current state, no double processing
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return payment;
    }

    // Query PayOS for the real payment status
    const paymentLink = await payOS.paymentRequests.get(orderCode);

    if (paymentLink.status !== 'PAID') {
      throw createHttpError(400, 'Thanh toán chưa hoàn tất');
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.completedAt = new Date();
    payment.cancellationReason = undefined;

    if (payment.targetMembership) {
      await applyMembershipUpgrade(payment, payment.targetMembership);
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
