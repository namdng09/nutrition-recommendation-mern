import { afterEach, describe, expect, it, vi } from 'vitest';

import { updatePaymentStatusRequestSchema } from '~/features/payments/payment-dto';
import { PaymentService } from '~/features/payments/payment-service';
import {
  getDailyTokenLimit,
  getNextQuotaResetAt
} from '~/shared/config/ai-quota';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';
import { UserModel } from '~/shared/database/models';
import { PaymentModel } from '~/shared/database/models/payment-model';
import { sendMail } from '~/shared/utils/email/mailer';
import { payOS } from '~/shared/utils/payos';

vi.mock('~/shared/database/models/payment-model', () => ({
  PaymentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    paginate: vi.fn()
  }
}));

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils/payos', () => ({
  payOS: {
    paymentRequests: {
      create: vi.fn(),
      get: vi.fn(),
      cancel: vi.fn()
    }
  }
}));

vi.mock('~/shared/utils/email/mailer', () => ({
  sendMail: vi.fn()
}));

vi.mock('~/shared/config/ai-quota', () => ({
  getDailyTokenLimit: vi.fn(() => 5000),
  getNextQuotaResetAt: vi.fn(() => new Date('2026-01-01T00:00:00.000Z'))
}));

const mockFindPayment = vi.mocked(PaymentModel.findOne);
const mockFindUser = vi.mocked(UserModel.findById);
const mockCancelPayLink = vi.mocked(payOS.paymentRequests.cancel);
const mockSendMail = vi.mocked(sendMail);
const mockGetDailyTokenLimit = vi.mocked(getDailyTokenLimit);
const mockGetNextQuotaResetAt = vi.mocked(getNextQuotaResetAt);

describe('PaymentService.updatePaymentStatus (UC104)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when status invalid', () => {
      const result = updatePaymentStatusRequestSchema.safeParse({
        status: 'bad'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Trạng thái thanh toán không hợp lệ'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 404 when payment not found', async () => {
      mockFindPayment.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      } as any);

      await expect(
        PaymentService.updatePaymentStatus({
          orderCode: 9001,
          status: PAYMENT_STATUS.CANCELLED
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy giao dịch với orderCode đã cho'
      });
    });

    it('should throw 400 when payment is not pending', async () => {
      mockFindPayment.mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          status: PAYMENT_STATUS.COMPLETED,
          targetMembership: MEMBERSHIP_LEVEL.VIP
        })
      } as any);

      await expect(
        PaymentService.updatePaymentStatus({
          orderCode: 9001,
          status: PAYMENT_STATUS.CANCELLED
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Giao dịch này đã được xử lý và không thể thay đổi trạng thái'
      });
    });

    it('should cancel payment with reason and cancel payOS link', async () => {
      const payment = {
        orderCode: 9001,
        status: PAYMENT_STATUS.PENDING,
        targetMembership: MEMBERSHIP_LEVEL.VIP,
        save: vi.fn(),
        populate: vi.fn().mockResolvedValue(true)
      };

      mockFindPayment.mockReturnValue({
        populate: vi.fn().mockResolvedValue(payment)
      } as any);

      const result = await PaymentService.updatePaymentStatus({
        orderCode: 9001,
        status: PAYMENT_STATUS.CANCELLED,
        cancellationReason: 'Admin cancel'
      });

      expect(result.status).toBe(PAYMENT_STATUS.CANCELLED);
      expect(result.cancellationReason).toBe('Admin cancel');
      expect(mockCancelPayLink).toHaveBeenCalledWith(9001, 'Admin cancel');
      expect(payment.save).toHaveBeenCalled();
    });

    it('should complete payment and apply VIP upgrade', async () => {
      const payment = {
        user: 'user-1',
        orderCode: 9001,
        amount: 100000,
        status: PAYMENT_STATUS.PENDING,
        targetMembership: MEMBERSHIP_LEVEL.VIP,
        save: vi.fn(),
        populate: vi.fn().mockResolvedValue(true)
      };
      const user = {
        membershipLevel: MEMBERSHIP_LEVEL.NORMAL,
        aiTokens: 100,
        email: 'user@test.com',
        name: 'User 1',
        save: vi.fn()
      };

      mockFindPayment.mockReturnValue({
        populate: vi.fn().mockResolvedValue(payment)
      } as any);
      mockFindUser.mockResolvedValue(user as any);

      const result = await PaymentService.updatePaymentStatus({
        orderCode: 9001,
        status: PAYMENT_STATUS.COMPLETED
      });

      expect(result.status).toBe(PAYMENT_STATUS.COMPLETED);
      expect(user.membershipLevel).toBe(MEMBERSHIP_LEVEL.VIP);
      expect(mockGetDailyTokenLimit).toHaveBeenCalledWith(MEMBERSHIP_LEVEL.VIP);
      expect(mockGetNextQuotaResetAt).toHaveBeenCalled();
      expect(user.save).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockCancelPayLink).toHaveBeenCalledWith(
        9001,
        'Đã xác nhận thủ công bởi admin'
      );
      expect(payment.save).toHaveBeenCalled();
    });
  });
});
