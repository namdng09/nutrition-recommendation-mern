import { afterEach, describe, expect, it, vi } from 'vitest';

import { DishService } from '~/features/dishes/dish-service';
import {
  DishModel,
  IngredientModel,
  UserModel
} from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn()
  },
  IngredientModel: {
    find: vi.fn()
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

const mockFindByIdDish = vi.mocked(DishModel.findById);
const mockFindIngredients = vi.mocked(IngredientModel.find);
const mockFindByIdUser = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'dish123';
const mockDish = {
  _id: { toString: () => VALID_ID },
  name: 'Phở bò',
  description: 'Phở bò truyền thống',
  ingredients: [
    { ingredientId: 'ing1', name: 'Thịt bò', image: 'beef.jpg' },
    { ingredientId: 'ing2', name: 'Bánh phở', image: 'noodles.jpg' }
  ],
  instructions: [
    { step: 1, description: 'Luộc xương' },
    { step: 2, description: 'Nấu nước dùng' }
  ],
  image: 'pho-bo.jpg',
  isActive: true,
  toObject: function () {
    return this;
  }
};

describe('DishService.viewDishDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.viewDishDetail('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });

      expect(mockFindByIdDish).not.toHaveBeenCalled();
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(null);

      await expect(DishService.viewDishDetail(VALID_ID)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should return dish detail successfully without userId', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);
      mockFindIngredients.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'ing1' }, { _id: 'ing2' }])
      } as any);

      const result = await DishService.viewDishDetail(VALID_ID);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
      expect(result.name).toBe('Phở bò');
      expect(result.ingredients).toBeDefined();
      expect(result.isFavorited).toBe(false);
    });

    it('should return dish detail with favorite status when userId provided', async () => {
      const userId = 'user123';
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);
      mockFindIngredients.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'ing1' }, { _id: 'ing2' }])
      } as any);
      mockFindByIdUser.mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          favoriteDishes: [VALID_ID]
        })
      } as any);

      const result = await DishService.viewDishDetail(VALID_ID, userId);

      expect(result).toBeDefined();
      expect(result.isFavorited).toBe(true);
    });

    it('should mark deleted ingredients', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);
      mockFindIngredients.mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: 'ing1' }])
      } as any);

      const result = await DishService.viewDishDetail(VALID_ID);

      expect(result).toBeDefined();
      expect(result.ingredients).toContainEqual(
        expect.objectContaining({
          ingredientId: 'ing1',
          isDeleted: false
        })
      );
    });
  });
});
