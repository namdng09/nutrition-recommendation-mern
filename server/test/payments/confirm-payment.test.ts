import { afterEach, describe, expect, it, vi } from 'vitest';

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
const mockGetPayLink = vi.mocked(payOS.paymentRequests.get);
const mockSendMail = vi.mocked(sendMail);
const mockGetDailyTokenLimit = vi.mocked(getDailyTokenLimit);
const mockGetNextQuotaResetAt = vi.mocked(getNextQuotaResetAt);

const orderCode = 900000001;
const userId = 'user-1';

describe('PaymentService.confirmPayment (UC99)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 404 when payment not found', async () => {
    mockFindPayment.mockResolvedValue(null);

    await expect(
      PaymentService.confirmPayment(orderCode, userId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy giao dịch'
    });
  });

  it('should throw 403 when payment does not belong to user', async () => {
    mockFindPayment.mockResolvedValue({
      user: { toString: () => 'other-user' }
    } as any);

    await expect(
      PaymentService.confirmPayment(orderCode, userId)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xác nhận giao dịch này'
    });
  });

  it('should return payment unchanged when not pending', async () => {
    const payment = {
      user: { toString: () => userId },
      status: PAYMENT_STATUS.COMPLETED
    };
    mockFindPayment.mockResolvedValue(payment as any);

    const result = await PaymentService.confirmPayment(orderCode, userId);

    expect(mockGetPayLink).not.toHaveBeenCalled();
    expect(result).toEqual(payment);
  });

  it('should mark payment cancelled when gateway returns failed/cancelled', async () => {
    const payment = {
      user: { toString: () => userId },
      status: PAYMENT_STATUS.PENDING,
      save: vi.fn()
    };
    mockFindPayment.mockResolvedValue(payment as any);
    mockGetPayLink.mockResolvedValue({ status: 'FAILED' } as any);

    const result = await PaymentService.confirmPayment(orderCode, userId);

    expect(result.status).toBe(PAYMENT_STATUS.CANCELLED);
    expect(result.cancellationReason).toBe(
      'Thanh toán đã bị hủy hoặc thất bại'
    );
    expect(payment.save).toHaveBeenCalled();
  });

  it('should complete payment and upgrade user membership when paid', async () => {
    const payment = {
      user: { toString: () => userId },
      orderCode,
      amount: 100000,
      targetMembership: MEMBERSHIP_LEVEL.VIP,
      status: PAYMENT_STATUS.PENDING,
      save: vi.fn()
    };
    const user = {
      email: 'user@test.com',
      name: 'User 1',
      aiTokens: 100,
      membershipLevel: MEMBERSHIP_LEVEL.NORMAL,
      save: vi.fn()
    };

    mockFindPayment.mockResolvedValue(payment as any);
    mockGetPayLink.mockResolvedValue({ status: 'PAID' } as any);
    mockFindUser.mockResolvedValue(user as any);

    const result = await PaymentService.confirmPayment(orderCode, userId);

    expect(result.status).toBe(PAYMENT_STATUS.COMPLETED);
    expect(user.membershipLevel).toBe(MEMBERSHIP_LEVEL.VIP);
    expect(mockGetDailyTokenLimit).toHaveBeenCalledWith(MEMBERSHIP_LEVEL.VIP);
    expect(mockGetNextQuotaResetAt).toHaveBeenCalled();
    expect(user.save).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(payment.save).toHaveBeenCalled();
  });

  it('should throw 400 when gateway status still pending-like', async () => {
    const payment = {
      user: { toString: () => userId },
      status: PAYMENT_STATUS.PENDING,
      save: vi.fn()
    };

    mockFindPayment.mockResolvedValue(payment as any);
    mockGetPayLink.mockResolvedValue({ status: 'PENDING' } as any);

    await expect(
      PaymentService.confirmPayment(orderCode, userId)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Thanh toán chưa hoàn tất'
    });
  });
});
