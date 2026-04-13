import { raceWithSignal } from '@langchain/core/runnables';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitReviewRequestSchema } from '~/features/reviews/review-dto';
import { ReviewService } from '~/features/reviews/review-service';
import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { DishModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindById = vi.mocked(DishModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const dishId = '507f1f77bcf86cd799439011';
const userId = 'user123';

describe('ReviewService.submitReview (UC92)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when dishId is empty', () => {
      const result = submitReviewRequestSchema.safeParse({ dishId: '' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'ID món ăn không được để trống'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when dishId format invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ReviewService.submitReview(userId, { dishId: 'bad-id' })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish not found', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        ReviewService.submitReview(userId, { dishId })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when dish does not belong to user', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => 'owner-1' } }
      } as any);

      await expect(
        ReviewService.submitReview(userId, { dishId })
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn chỉ có thể gửi yêu cầu đánh giá món ăn do chính mình tạo'
      });
    });

    it('should throw 400 when dish is public', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } },
        isPublic: true
      } as any);

      await expect(
        ReviewService.submitReview(userId, { dishId })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Món ăn công khai không cần đánh giá'
      });
    });

    it('should throw 400 when dish already evaluated', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        user: { _id: { toString: () => userId } },
        isPublic: false,
        evaluation: { status: REVIEW_STATUS.EVALUATED }
      } as any);

      await expect(
        ReviewService.submitReview(userId, { dishId })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Món ăn này đã được đánh giá'
      });
    });

    it('should submit review successfully and set pending status', async () => {
      const mockSave = vi.fn();
      const dish = {
        user: { _id: { toString: () => userId } },
        isPublic: false,
        evaluation: {
          status: null,
          rating: null,
          feedback: null
        },
        save: mockSave,
        toObject: vi.fn(() => ({
          _id: dishId,
          evaluation: { status: REVIEW_STATUS.PENDING }
        }))
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(dish as any);

      const result = await ReviewService.submitReview(userId, { dishId });

      expect(mockSave).toHaveBeenCalled();
      expect(result.evaluation?.status).toBe(REVIEW_STATUS.PENDING);
    });
  });
});
