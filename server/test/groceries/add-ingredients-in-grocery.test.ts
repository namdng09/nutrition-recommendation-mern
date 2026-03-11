import { afterEach, describe, expect, it, vi } from 'vitest';

import { addIngredientsRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel, IngredientModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { findOne: vi.fn() },
  IngredientModel: { find: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockIngredientFind = vi.mocked(IngredientModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const GROCERY_ID = 'grocery123';

const makeMockGrocery = (ingredients: any[] = []) => ({
  _id: { toString: () => GROCERY_ID },
  name: 'Danh sách tuần 1',
  ingredients,
  save: vi.fn()
});

describe('GroceryService.addIngredientsInGrocery', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when ingredients array is empty', () => {
      const result = addIngredientsRequestSchema.safeParse({
        ingredients: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Phải có ít nhất 1 ID nguyên liệu để thêm'
      );
    });

    it('should fail when ingredients is missing', () => {
      const result = addIngredientsRequestSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        GroceryService.addIngredientsInGrocery('invalid-id', GROCERY_ID, {
          ingredients: ['ing1']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when groceryId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.addIngredientsInGrocery(USER_ID, 'invalid-id', {
          ingredients: ['ing1']
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
        GroceryService.addIngredientsInGrocery(USER_ID, GROCERY_ID, {
          ingredients: ['ing1']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should throw 400 when duplicate ingredient ids in request', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(makeMockGrocery() as any);

      await expect(
        GroceryService.addIngredientsInGrocery(USER_ID, GROCERY_ID, {
          ingredients: ['ing1', 'ing1']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Không được có nguyên liệu trùng lặp trong danh sách'
      });
    });

    it('should throw 400 when an ingredient id is invalid', async () => {
      mockValidateObjectId
        .mockReturnValueOnce(true) // userId
        .mockReturnValueOnce(true) // groceryId
        .mockReturnValueOnce(false); // ingredientId

      mockFindOne.mockResolvedValue(makeMockGrocery() as any);

      await expect(
        GroceryService.addIngredientsInGrocery(USER_ID, GROCERY_ID, {
          ingredients: ['invalid-ing']
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'ID nguyên liệu không hợp lệ: invalid-ing'
      });
    });

    it('should throw 404 when an ingredient is not found', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(makeMockGrocery() as any);
      mockIngredientFind.mockResolvedValue([] as any); // found 0 but requested 1

      await expect(
        GroceryService.addIngredientsInGrocery(USER_ID, GROCERY_ID, {
          ingredients: ['ing1']
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu với ID: ing1'
      });
    });

    it('should add new ingredients to grocery successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const mockGrocery = makeMockGrocery([]);
      mockFindOne.mockResolvedValue(mockGrocery as any);

      const mockIngredient = {
        _id: { toString: () => 'ing1' },
        name: 'Cà chua',
        image: 'https://example.com/img.jpg'
      };
      mockIngredientFind.mockResolvedValue([mockIngredient] as any);

      const result = await GroceryService.addIngredientsInGrocery(
        USER_ID,
        GROCERY_ID,
        { ingredients: ['ing1'] }
      );

      expect(mockGrocery.save).toHaveBeenCalled();
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe('Cà chua');
    });
  });
});
