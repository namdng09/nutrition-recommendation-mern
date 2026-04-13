import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateGroceryIngredientRequestSchema } from '~/features/groceries/grocery-dto';
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
const ingredientId = '507f1f77bcf86cd799439012';

const makeGrocery = (isPurchased = false) => ({
  _id: groceryId,
  ingredients: [
    {
      ingredientId: { toString: () => ingredientId },
      name: 'Ca chua',
      isPurchased
    }
  ],
  save: vi.fn()
});

describe('GroceryService.updateIngredientInGrocery (UC34)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when isPurchased is invalid', () => {
      const result = updateGroceryIngredientRequestSchema.safeParse({
        isPurchased: 'invalid'
      });

      expect(result.success).toBe(false);
    });
  });

  describe('business logic', () => {
    it('should throw 400 when grocery id is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.updateIngredientInGrocery(
          userId,
          'invalid-id',
          ingredientId,
          {
            isPurchased: true
          }
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 400 when ingredient id is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.updateIngredientInGrocery(
          userId,
          groceryId,
          'invalid-ing',
          {
            isPurchased: true
          }
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);

      await expect(
        GroceryService.updateIngredientInGrocery(
          userId,
          groceryId,
          ingredientId,
          {
            isPurchased: true
          }
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should throw 404 when ingredient does not exist in grocery', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue({ ingredients: [], save: vi.fn() } as any);

      await expect(
        GroceryService.updateIngredientInGrocery(
          userId,
          groceryId,
          ingredientId,
          {
            isPurchased: true
          }
        )
      ).rejects.toMatchObject({
        status: 404,
        message: `Không tìm thấy nguyên liệu với ID: ${ingredientId} trong danh sách mua sắm`
      });
    });

    it('should mark ingredient as purchased successfully', async () => {
      const grocery = makeGrocery(false);
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(grocery as any);

      const result = await GroceryService.updateIngredientInGrocery(
        userId,
        groceryId,
        ingredientId,
        { isPurchased: true }
      );

      expect(result.ingredients[0].isPurchased).toBe(true);
      expect(grocery.save).toHaveBeenCalled();
    });
  });
});
