import { afterEach, describe, expect, it, vi } from 'vitest';

import { ReviewService } from '~/features/reviews/review-service';
import { REVIEW_STATUS } from '~/shared/constants/review-status';
import { DishModel, UserModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

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
    validateObjectId: vi.fn()
  };
});

const mockFindById = vi.mocked(DishModel.findById);
const mockFindUserById = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const dishId = '507f1f77bcf86cd799439011';
const nutritionistId = 'nutritionist-1';

describe('ReviewService.viewReviewDetail (UC94)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when dishId invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      ReviewService.viewReviewDetail('bad-id', nutritionistId)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID món ăn không hợp lệ'
    });
  });

  it('should throw 404 when dish not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null)
    } as any);

    await expect(
      ReviewService.viewReviewDetail(dishId, nutritionistId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy món ăn'
    });
  });

  it('should throw 404 when review request does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: dishId,
        evaluation: null
      })
    } as any);

    await expect(
      ReviewService.viewReviewDetail(dishId, nutritionistId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy yêu cầu đánh giá'
    });
  });

  it('should allow viewing pending review detail', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindUserById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      })
    } as any);

    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        evaluation: {
          status: REVIEW_STATUS.PENDING,
          nutritionistId: null
        },
        toObject: vi.fn(() => ({
          _id: dishId,
          evaluation: { status: REVIEW_STATUS.PENDING, nutritionistId: null }
        }))
      })
    } as any);

    const result = await ReviewService.viewReviewDetail(dishId, nutritionistId);

    expect(result._id).toBe(dishId);
  });

  it('should throw 403 when evaluated by another nutritionist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        evaluation: {
          status: REVIEW_STATUS.EVALUATED,
          nutritionistId: 'nutritionist-2'
        },
        toObject: vi.fn(() => ({
          _id: dishId,
          evaluation: {
            status: REVIEW_STATUS.EVALUATED,
            nutritionistId: 'nutritionist-2'
          }
        }))
      })
    } as any);

    await expect(
      ReviewService.viewReviewDetail(dishId, nutritionistId)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xem yêu cầu đánh giá này'
    });
  });

  it('should allow assigned nutritionist to view evaluated review', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindUserById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: nutritionistId,
          name: 'Nutritionist A',
          avatar: 'avatar.jpg'
        })
      })
    } as any);

    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        evaluation: {
          status: REVIEW_STATUS.EVALUATED,
          nutritionistId
        },
        toObject: vi.fn(() => ({
          _id: dishId,
          evaluation: { status: REVIEW_STATUS.EVALUATED, nutritionistId }
        }))
      })
    } as any);

    const result = await ReviewService.viewReviewDetail(dishId, nutritionistId);

    expect(result._id).toBe(dishId);
    expect(result.evaluation.nutritionist).toMatchObject({
      _id: nutritionistId,
      name: 'Nutritionist A',
      avatar: 'avatar.jpg'
    });
  });
});
