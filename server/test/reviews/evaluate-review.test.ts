import { afterEach, describe, expect, it, vi } from 'vitest';

import { evaluateReviewRequestSchema } from '~/features/reviews/review-dto';
import { ReviewService } from '~/features/reviews/review-service';
import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { DishModel, UserModel } from '~/shared/database/models';
import { toObjectId, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    toObjectId: vi.fn((id: string) => `oid-${id}`)
  };
});

const mockFindById = vi.mocked(DishModel.findById);
const mockUserFindById = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockToObjectId = vi.mocked(toObjectId);

const dishId = '507f1f77bcf86cd799439011';
const nutritionistId = 'nutritionist-1';

describe('ReviewService.evaluateReview (UC95)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when rating out of range', () => {
      const result = evaluateReviewRequestSchema.safeParse({
        rating: 6,
        feedback: 'Good'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Điểm đánh giá tối đa là 5');
    });

    it('should fail when feedback too short', () => {
      const result = evaluateReviewRequestSchema.safeParse({
        rating: 4,
        feedback: 'a'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Nội dung phản hồi phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when dishId invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        ReviewService.evaluateReview('bad-id', nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish not found', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        ReviewService.evaluateReview(dishId, nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 404 when no review request exists', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({ evaluation: null } as any);

      await expect(
        ReviewService.evaluateReview(dishId, nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy yêu cầu đánh giá'
      });
    });

    it('should throw 400 when review is not pending', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        evaluation: { status: REVIEW_STATUS.EVALUATED }
      } as any);

      await expect(
        ReviewService.evaluateReview(dishId, nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Chỉ có thể đánh giá yêu cầu đang được xử lý'
      });
    });

    it('should throw 403 when other nutritionist has already evaluated the review', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        evaluation: {
          status: REVIEW_STATUS.PENDING,
          nutritionistId: 'nutritionist-2'
        }
      } as any);

      await expect(
        ReviewService.evaluateReview(dishId, nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 403,
        message: 'Yêu cầu đã được xử lý bởi chuyên gia khác'
      });
    });

    it('should throw 410 when dish is deleted or inactive', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        evaluation: {
          status: REVIEW_STATUS.PENDING,
          nutritionistId: null
        },
        isActive: false
      } as any);

      await expect(
        ReviewService.evaluateReview(dishId, nutritionistId, {
          rating: 5,
          feedback: 'Good'
        })
      ).rejects.toMatchObject({
        status: 410,
        message: 'Món ăn đã được xóa, không thể đánh giá'
      });
    });

    it('should evaluate pending review successfully', async () => {
      const mockSave = vi.fn();
      const dish = {
        evaluation: {
          status: REVIEW_STATUS.PENDING,
          nutritionistId: null
        },
        isActive: true,
        save: mockSave,
        toObject: vi.fn(() => ({
          _id: dishId,
          evaluation: {
            status: REVIEW_STATUS.EVALUATED,
            nutritionistId: 'oid-nutritionist-1',
            rating: 5,
            feedback: 'Good dish'
          }
        }))
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(dish as any);
      mockUserFindById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({
            _id: `oid-${nutritionistId}`,
            name: 'Nutritionist A',
            avatar: 'avatar.jpg'
          })
        })
      } as any);

      const result = await ReviewService.evaluateReview(
        dishId,
        nutritionistId,
        {
          rating: 5,
          feedback: 'Good dish'
        }
      );

      expect(mockToObjectId).toHaveBeenCalledWith(nutritionistId);
      expect(mockUserFindById).toHaveBeenCalledWith(nutritionistId);
      expect(dish.evaluation.status).toBe(REVIEW_STATUS.EVALUATED);
      expect(mockSave).toHaveBeenCalled();
      expect(result.evaluation?.status).toBe(REVIEW_STATUS.EVALUATED);
    });
  });
});
