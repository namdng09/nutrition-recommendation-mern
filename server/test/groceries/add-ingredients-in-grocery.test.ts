import { afterEach, describe, expect, it, vi } from 'vitest';

import { addGroceryIngredientRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel, IngredientModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    findOne: vi.fn()
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

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockIngredientFind = vi.mocked(IngredientModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const groceryId = '507f1f77bcf86cd799439011';

const makeGrocery = (ingredients: any[] = []) => ({
  _id: groceryId,
  ingredients,
  save: vi.fn()
});

describe('GroceryService.addIngredientsInGrocery (UC33)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when ingredient id list is empty', () => {
      const result = addGroceryIngredientRequestSchema.safeParse({
        ingredients: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Phải có ít nhất 1 ID nguyên liệu để thêm'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when grocery id is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.addIngredientsInGrocery(userId, 'invalid-id', {
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
        GroceryService.addIngredientsInGrocery(userId, groceryId, {
          ingredients: ['ing-1']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should throw 400 when ingredient ids duplicated in request', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(makeGrocery() as any);

      await expect(
        GroceryService.addIngredientsInGrocery(userId, groceryId, {
          ingredients: ['ing-1', 'ing-1']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Không được có nguyên liệu trùng lặp trong danh sách'
      });
    });

    it('should throw 400 when ingredient id format is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockFindOne.mockResolvedValue(makeGrocery() as any);

      await expect(
        GroceryService.addIngredientsInGrocery(userId, groceryId, {
          ingredients: ['invalid-ing']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'ID nguyên liệu không hợp lệ: invalid-ing'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(makeGrocery() as any);
      mockIngredientFind.mockResolvedValue([] as any);

      await expect(
        GroceryService.addIngredientsInGrocery(userId, groceryId, {
          ingredients: ['ing-1']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu với ID: ing-1'
      });
    });

    it('should add ingredients to grocery successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const grocery = makeGrocery([
        {
          ingredientId: 'ing-1',
          name: 'Muoi',
          image: 'muoi.jpg',
          isPurchased: false
        }
      ]);
      mockFindOne.mockResolvedValue(grocery as any);
      mockIngredientFind.mockResolvedValue([
        { _id: 'ing-2', name: 'Duong', image: 'duong.jpg' },
        { _id: 'ing-3', name: 'Bot ot', image: 'bot-ot.jpg' }
      ] as any);

      await GroceryService.addIngredientsInGrocery(userId, groceryId, {
        ingredients: ['ing-2', 'ing-3']
      });

      expect(grocery.ingredients).toHaveLength(3);
    });
  });
});
