import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPaymentRequestSchema } from '~/features/payments/payment-dto';
import { PaymentService } from '~/features/payments/payment-service';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { UserModel } from '~/shared/database/models';
import { PaymentModel } from '~/shared/database/models/payment-model';
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

const mockFindPayment = vi.mocked(PaymentModel.findOne);
const mockCreatePayment = vi.mocked(PaymentModel.create);
const mockFindUser = vi.mocked(UserModel.findById);
const mockCreatePayLink = vi.mocked(payOS.paymentRequests.create);

const userId = 'user-1';

const validData = {
  amount: 100000,
  description: 'Nang cap VIP',
  returnUrl: 'https://app.test/return',
  cancelUrl: 'https://app.test/cancel',
  targetMembership: MEMBERSHIP_LEVEL.VIP
};

describe('PaymentService.createPayment (UC98)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when amount is not positive', () => {
      const result = createPaymentRequestSchema.safeParse({
        ...validData,
        amount: 0
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Số tiền phải lớn hơn 0');
    });
  });

  describe('business logic', () => {
    it('should throw 404 when user does not exist', async () => {
      mockFindUser.mockResolvedValue(null);

      await expect(
        PaymentService.createPayment(validData, userId)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Người dùng không tồn tại'
      });
    });

    it('should throw 400 when user already has target membership', async () => {
      mockFindUser.mockResolvedValue({
        membershipLevel: MEMBERSHIP_LEVEL.VIP
      } as any);

      await expect(
        PaymentService.createPayment(validData, userId)
      ).rejects.toMatchObject({
        status: 400,
        message: `Bạn đã là thành viên ${MEMBERSHIP_LEVEL.VIP}`
      });
    });

    it('should throw 400 when trying to downgrade VIP to normal', async () => {
      mockFindUser.mockResolvedValue({
        membershipLevel: MEMBERSHIP_LEVEL.VIP
      } as any);

      await expect(
        PaymentService.createPayment(
          { ...validData, targetMembership: MEMBERSHIP_LEVEL.NORMAL },
          userId
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Không thể hạ cấp từ VIP xuống tài khoản thường'
      });
    });

    it('should throw 409 when generated order code already exists', async () => {
      mockFindUser.mockResolvedValue({
        membershipLevel: MEMBERSHIP_LEVEL.NORMAL
      } as any);
      mockFindPayment
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ _id: 'existing' } as any);

      await expect(
        PaymentService.createPayment(validData, userId)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Mã đơn hàng đã tồn tại, vui lòng thử lại'
      });
    });

    it('should throw 409 when user already has pending payment', async () => {
      mockFindUser.mockResolvedValue({
        membershipLevel: MEMBERSHIP_LEVEL.NORMAL
      } as any);
      mockFindPayment.mockResolvedValueOnce({ _id: 'pending-payment' } as any);

      await expect(
        PaymentService.createPayment(validData, userId)
      ).rejects.toMatchObject({
        status: 409,
        message:
          'Bạn đang có giao dịch chờ thanh toán. Vui lòng hoàn tất hoặc hủy giao dịch hiện tại trước khi tạo giao dịch mới.'
      });
    });

    it('should create pending payment and return checkout url successfully', async () => {
      mockFindUser.mockResolvedValue({
        membershipLevel: MEMBERSHIP_LEVEL.NORMAL
      } as any);
      mockFindPayment.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockCreatePayLink.mockResolvedValue({
        orderCode: 900000001,
        checkoutUrl: 'https://pay.test/checkout',
        paymentLinkId: 'plink-1'
      } as any);
      mockCreatePayment.mockResolvedValue({
        checkoutUrl: 'https://pay.test/checkout'
      } as any);

      const result = await PaymentService.createPayment(validData, userId);

      expect(mockCreatePayLink).toHaveBeenCalled();
      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          amount: validData.amount,
          targetMembership: MEMBERSHIP_LEVEL.VIP
        })
      );
      expect(result).toBe('https://pay.test/checkout');
    });
  });
});
