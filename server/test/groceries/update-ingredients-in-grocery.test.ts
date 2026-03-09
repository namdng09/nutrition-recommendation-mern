import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { findOne: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const GROCERY_ID = 'grocery123';
const INGREDIENT_ID = 'ing1';

const makeMockGrocery = (ingredients: any[]) => ({
  _id: { toString: () => GROCERY_ID },
  name: 'Danh sách tuần 1',
  ingredients,
  save: vi.fn()
});

describe('GroceryService.updateIngredientInGrocery', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        GroceryService.updateIngredientInGrocery(
          'invalid-id',
          GROCERY_ID,
          INGREDIENT_ID,
          { isPurchased: true }
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when groceryId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.updateIngredientInGrocery(
          USER_ID,
          'invalid-id',
          INGREDIENT_ID,
          { isPurchased: true }
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 400 when ingredientId is invalid', async () => {
      mockValidateObjectId
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(
        GroceryService.updateIngredientInGrocery(
          USER_ID,
          GROCERY_ID,
          'invalid-ing',
          { isPurchased: true }
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
          USER_ID,
          GROCERY_ID,
          INGREDIENT_ID,
          { isPurchased: true }
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should throw 404 when ingredient not found in grocery', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(makeMockGrocery([]) as any);

      await expect(
        GroceryService.updateIngredientInGrocery(
          USER_ID,
          GROCERY_ID,
          INGREDIENT_ID,
          { isPurchased: true }
        )
      ).rejects.toMatchObject({
        status: 404,
        message: `Không tìm thấy nguyên liệu với ID: ${INGREDIENT_ID} trong danh sách mua sắm`
      });
    });

    it('should update isPurchased status successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const mockGrocery = makeMockGrocery([
        {
          ingredientId: { toString: () => INGREDIENT_ID },
          name: 'Cà chua',
          isPurchased: false
        }
      ]);
      mockFindOne.mockResolvedValue(mockGrocery as any);

      await GroceryService.updateIngredientInGrocery(
        USER_ID,
        GROCERY_ID,
        INGREDIENT_ID,
        { isPurchased: true }
      );

      expect(mockGrocery.ingredients[0].isPurchased).toBe(true);
      expect(mockGrocery.save).toHaveBeenCalled();
    });
  });
});
