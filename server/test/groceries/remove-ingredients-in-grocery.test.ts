import { afterEach, describe, expect, it, vi } from 'vitest';

import { removeGroceryIngredientRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    findOne: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const groceryId = '507f1f77bcf86cd799439011';

const makeGrocery = () => {
  const state = {
    ingredients: [
      { ingredientId: { toString: () => 'ing-1' }, name: 'Ca chua' },
      { ingredientId: { toString: () => 'ing-2' }, name: 'Thit bo' }
    ] as any[]
  };

  return {
    ...state,
    save: vi.fn(),
    set: vi.fn((key: string, value: any[]) => {
      if (key === 'ingredients') {
        state.ingredients = value;
      }
    }),
    get ingredients() {
      return state.ingredients;
    }
  };
};

describe('GroceryService.removeIngredientsInGrocery (UC35)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when ingredient id list is empty', () => {
      const result = removeGroceryIngredientRequestSchema.safeParse({
        ingredients: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Phải có ít nhất 1 ID nguyên liệu để xóa'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when grocery id is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.removeIngredientsInGrocery(userId, 'invalid-id', {
          ingredients: ['ing-1']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);

      await expect(
        GroceryService.removeIngredientsInGrocery(userId, groceryId, {
          ingredients: ['ing-1']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should throw 404 when no ingredient matched in grocery', async () => {
      const grocery = makeGrocery();
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(grocery as any);

      await expect(
        GroceryService.removeIngredientsInGrocery(userId, groceryId, {
          ingredients: ['ing-missing']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu nào trong danh sách mua sắm'
      });
    });

    it('should remove selected ingredients successfully', async () => {
      const grocery = makeGrocery();
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(grocery as any);

      const result = await GroceryService.removeIngredientsInGrocery(
        userId,
        groceryId,
        {
          ingredients: ['ing-1']
        }
      );

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe('Thit bo');
      expect(grocery.save).toHaveBeenCalled();
    });
  });
});
