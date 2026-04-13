import { afterEach, describe, expect, it, vi } from 'vitest';

import { ReviewService } from '~/features/reviews/review-service';
import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { DishModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
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

const mockPaginate = vi.mocked(DishModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

const nutritionistId = 'nutritionist-1';
const parsed = { filter: {}, limit: 10 } as any;
const options = { limit: 10, page: 1 };

describe('ReviewService.listReviews (UC93)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should list pending and own evaluated reviews for nutritionist', async () => {
    mockBuildPaginateOptions.mockReturnValue(options as any);
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'd1' }],
      totalDocs: 1
    } as any);

    const result = await ReviewService.listReviews(parsed, nutritionistId);

    expect(mockPaginate).toHaveBeenCalledWith(
      {
        $or: [
          { 'evaluation.status': REVIEW_STATUS.PENDING },
          {
            'evaluation.status': REVIEW_STATUS.EVALUATED,
            'evaluation.nutritionistId': nutritionistId
          }
        ]
      },
      {
        ...options,
        select: 'name image user evaluation createdAt updatedAt'
      }
    );
    expect(result.docs).toHaveLength(1);
  });
});
