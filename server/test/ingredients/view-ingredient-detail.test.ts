import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';

describe('IngredientService.viewIngredientDetail', () => {
  let ingredientId: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Create a test ingredient for happy case
    const ingredient = await IngredientModel.create({
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      nutrition: {
        nutrients: [
          { label: 'Năng lượng', value: 18, unit: UNIT.KILOCALORIE },
          { label: 'Protein', value: 0.9, unit: UNIT.GRAM },
          { label: 'Chất béo', value: 0.2, unit: UNIT.GRAM },
          { label: 'Tinh bột', value: 3.9, unit: UNIT.GRAM },
          { label: 'Chất xơ', value: 1.2, unit: UNIT.GRAM },
          { label: 'Cholesterol', value: 0, unit: UNIT.MILLIGRAM }
        ],
        minerals: []
      },
      isActive: true
    });
    ingredientId = ingredient._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await IngredientModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should get ingredient detail successfully', async () => {
    const ingredient =
      await IngredientService.viewIngredientDetail(ingredientId);

    expect(ingredient).toBeDefined();
    expect(ingredient._id.toString()).toBe(ingredientId);
    expect(ingredient.name).toBe('Cà chua');
    expect(ingredient.description).toBe('Cà chua tươi');
    expect(ingredient.categories).toContain(INGREDIENT_CATEGORY.VEGETABLES);
    expect(ingredient.baseUnit).toHaveProperty('amount', 100);
    expect(ingredient.baseUnit).toHaveProperty('unit', UNIT.GRAM);
    expect(ingredient.nutrition).toBeDefined();
    expect(ingredient.isActive).toBe(true);
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      IngredientService.viewIngredientDetail('invalid-id')
    ).rejects.toThrow('Định dạng ID nguyên liệu không hợp lệ');
  });

  // Branch - Ingredient not found
  it('should throw error when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      IngredientService.viewIngredientDetail(nonExistentId)
    ).rejects.toThrow('Không tìm thấy nguyên liệu');
  });
});
