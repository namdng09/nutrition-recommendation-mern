import { afterEach, describe, expect, it, vi } from 'vitest';

import { PaymentService } from '~/features/payments/payment-service';
import { PaymentModel } from '~/shared/database/models/payment-model';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models/payment-model', () => ({
  PaymentModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    paginate: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(PaymentModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const userId = '507f1f77bcf86cd799439011';
const parsed = { filter: {}, limit: 10 } as any;
const options = { page: 1, limit: 10 };

describe('PaymentService.listPayments (UC99)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get payments history successfully', async () => {
    mockBuildPaginateOptions.mockReturnValue(options as any);
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'p1' }],
      totalDocs: 1
    } as any);

    const result = await PaymentService.getPaymentsHistory(userId, parsed);

    expect(mockPaginate).toHaveBeenCalledWith(
      { user: userId },
      {
        ...options,
        populate: { path: 'user', select: 'name email membershipLevel' }
      }
    );
    expect(result.docs).toHaveLength(1);
  });
});
