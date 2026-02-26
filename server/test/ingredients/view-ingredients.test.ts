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

describe('IngredientService.viewIngredients', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Create test ingredients
    await IngredientModel.create([
      {
        name: 'Cà chua',
        description: 'Cà chua tươi',
        categories: [INGREDIENT_CATEGORY.VEGETABLES],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Thịt bò',
        description: 'Thịt bò Úc',
        categories: [INGREDIENT_CATEGORY.MEAT],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Cá hồi',
        description: 'Cá hồi Na Uy',
        categories: [INGREDIENT_CATEGORY.SEAFOOD],
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        allergens: [],
        isActive: true
      },
      {
        name: 'Sữa tươi',
        description: 'Sữa tươi Vinamilk',
        categories: [INGREDIENT_CATEGORY.DAIRY],
        baseUnit: { amount: 100, unit: UNIT.MILLILITER },
        allergens: [],
        isActive: false
      }
    ]);
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
  it('should get all ingredients successfully', async () => {
    const result = await IngredientService.viewIngredients({
      filter: {},
      limit: 10
    });

    expect(result).toBeDefined();
    expect(result.docs).toBeDefined();
    expect(Array.isArray(result.docs)).toBe(true);
    expect(result.docs.length).toBe(4);
  });
});
