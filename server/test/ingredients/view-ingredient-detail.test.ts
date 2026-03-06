import { afterEach, describe, expect, it, vi } from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
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

const mockFindById = vi.mocked(IngredientModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

const VALID_ID = 'abc123';
const mockIngredient = {
  _id: { toString: () => VALID_ID },
  name: 'Cà chua',
  description: 'Cà chua tươi',
  categories: [INGREDIENT_CATEGORY.VEGETABLES],
  baseUnit: { amount: 100, unit: UNIT.GRAM },
  nutrition: { nutrients: [], minerals: [] },
  isActive: true
};

describe('IngredientService.viewIngredientDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        IngredientService.viewIngredientDetail('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        IngredientService.viewIngredientDetail(VALID_ID)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu'
      });
    });

    it('should return ingredient detail successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockIngredient as any);

      const result = await IngredientService.viewIngredientDetail(VALID_ID);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(VALID_ID);
      expect(result.name).toBe('Cà chua');
      expect(result.description).toBe('Cà chua tươi');
      expect(result.categories).toContain(INGREDIENT_CATEGORY.VEGETABLES);
      expect(result.baseUnit).toHaveProperty('amount', 100);
      expect(result.baseUnit).toHaveProperty('unit', UNIT.GRAM);
      expect(result.nutrition).toBeDefined();
      expect(result.isActive).toBe(true);
    });
  });
});
