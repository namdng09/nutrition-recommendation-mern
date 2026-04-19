import { z } from 'zod';

import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';

export const createPaymentRequestSchema = z.object({
  amount: z.coerce
    .number('Số tiền phải là một số')
    .positive('Số tiền phải lớn hơn 0'),
  description: z
    .string('Mô tả không hợp lệ')
    .trim()
    .min(1, 'Mô tả là bắt buộc'),
  returnUrl: z
    .string('returnUrl không hợp lệ')
    .trim()
    .min(1, 'returnUrl là bắt buộc'),
  cancelUrl: z
    .string('cancelUrl không hợp lệ')
    .trim()
    .min(1, 'cancelUrl là bắt buộc'),
  targetMembership: z
    .enum(Object.values(MEMBERSHIP_LEVEL), 'Hạng thành viên không hợp lệ')
    .optional()
});

export type CreatePaymentRequest = z.infer<typeof createPaymentRequestSchema>;

export const updatePaymentStatusRequestSchema = z.object({
  status: z.enum(
    [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.CANCELLED],
    'Trạng thái thanh toán không hợp lệ'
  ),
  cancellationReason: z.string('Lý do hủy không hợp lệ').trim().optional()
});

export type UpdatePaymentStatusRequest = z.infer<
  typeof updatePaymentStatusRequestSchema
> & { orderCode: number };

const payOSWebhookDataSchema = z
  .object({
    orderCode: z.number('orderCode không hợp lệ')
  })
  .passthrough();

export const payOSWebhookRequestSchema = z.object({
  code: z.string('Mã phản hồi webhook không hợp lệ'),
  desc: z.string('Mô tả phản hồi webhook không hợp lệ'),
  success: z.boolean('Trạng thái webhook không hợp lệ'),
  data: payOSWebhookDataSchema,
  signature: z.string('Chữ ký webhook không hợp lệ')
});

export type PayOSWebhookRequest = z.infer<typeof payOSWebhookRequestSchema>;
