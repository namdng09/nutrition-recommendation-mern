import { afterEach, describe, expect, it, vi } from 'vitest';

import { PaymentService } from '~/features/payments/payment-service';
import { PaymentModel } from '~/shared/database/models/payment-model';

vi.mock('~/shared/database/models/payment-model', () => ({
  PaymentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    paginate: vi.fn()
  }
}));

const mockFindOne = vi.mocked(PaymentModel.findOne);

describe('PaymentService.getPaymentByOrderCode (UC103)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when orderCode invalid', async () => {
    await expect(PaymentService.getPaymentByOrderCode(0)).rejects.toMatchObject(
      {
        status: 400,
        message: 'orderCode must be a positive number'
      }
    );
  });

  it('should throw 404 when payment not found', async () => {
    mockFindOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(null)
    } as any);

    await expect(
      PaymentService.getPaymentByOrderCode(900000001)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Payment not found'
    });
  });

  it('should return payment by orderCode', async () => {
    const payment = { _id: 'p1', orderCode: 900000001 };
    mockFindOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(payment)
    } as any);

    const result = await PaymentService.getPaymentByOrderCode(900000001);

    expect(result).toEqual(payment);
    expect(mockFindOne).toHaveBeenCalledWith({
      orderCode: 900000001,
      targetMembership: { $exists: true }
    });
  });
});
