import { afterEach, describe, expect, it, vi } from 'vitest';

import { PaymentService } from '~/features/payments/payment-service';
import { PaymentModel } from '~/shared/database/models/payment-model';
import {
  buildPaginateOptions,
  toObjectId,
  validateObjectId
} from '~/shared/utils';

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
    validateObjectId: vi.fn(),
    toObjectId: vi.fn((id: string) => `oid-${id}`),
    buildPaginateOptions: vi.fn()
  };
});

const mockPaginate = vi.mocked(PaymentModel.paginate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockToObjectId = vi.mocked(toObjectId);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const userId = '507f1f77bcf86cd799439011';
const parsed = { filter: {}, limit: 10 } as any;
const options = { page: 1, limit: 10 };

describe('PaymentService.listPaymentsByUser (UC101/UC102)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when userId invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      PaymentService.listPaymentsByUser('bad-id', parsed)
    ).rejects.toMatchObject({ status: 400, message: 'Invalid userId' });
  });

  it('should list user payment history successfully', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockBuildPaginateOptions.mockReturnValue(options as any);
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'p1' }],
      totalDocs: 1
    } as any);

    const result = await PaymentService.listPaymentsByUser(userId, parsed);

    expect(mockToObjectId).toHaveBeenCalledWith(userId);
    expect(mockPaginate).toHaveBeenCalledWith(
      { user: `oid-${userId}` },
      {
        ...options,
        populate: { path: 'user', select: 'name email membershipLevel' }
      }
    );
    expect(result.docs).toHaveLength(1);
  });
});
