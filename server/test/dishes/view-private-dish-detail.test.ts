import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import { DishModel, IngredientModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn()
  },
  IngredientModel: {
    find: vi.fn()
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
const mockFindIngredients = vi.mocked(IngredientModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'dish123';
const userId = 'user123';
const otherUserId = 'other-user-456';

const mockDish = {
  _id: { toString: () => VALID_ID },
  name: 'Phở bò private',
  isPublic: false,
  user: { _id: { toString: () => userId } },
  ingredients: [
    { ingredientId: 'ing1', name: 'Thịt bò', image: 'beef.jpg' },
    { ingredientId: 'ing2', name: 'Bánh phở', image: 'noodles.jpg' }
  ],
  toObject: function () {
    return this;
  }
};

describe('DishService.viewPrivateDishDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.viewPrivateDishDetail('invalid-id', userId)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        DishService.viewPrivateDishDetail(VALID_ID, userId)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when dish is public', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({ ...mockDish, isPublic: true } as any);

      await expect(
        DishService.viewPrivateDishDetail(VALID_ID, userId)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Món ăn này không phải là món ăn riêng tư'
      });
    });

    it('should throw 403 when user is not owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);

      await expect(
        DishService.viewPrivateDishDetail(VALID_ID, otherUserId)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền xem món ăn riêng tư này'
      });
    });

    it('should return private dish detail successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockDish as any);
      mockFindIngredients.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'ing1' }, { _id: 'ing2' }])
      } as any);

      const result = await DishService.viewPrivateDishDetail(VALID_ID, userId);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
      expect(result.name).toBe('Phở bò private');
      expect(result.ingredients).toHaveLength(2);
    });
  });
});
