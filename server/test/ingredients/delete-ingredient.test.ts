import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';

// Mock Cloudinary delete
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
      public_id: 'test-image',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

describe('IngredientService.deleteIngredient', () => {
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
    // Create test ingredient
    const ingredient = await IngredientModel.create({
      name: 'Cà chua',
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
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
  it('should delete ingredient successfully', async () => {
    const deletedIngredient =
      await IngredientService.deleteIngredient(ingredientId);

    expect(deletedIngredient).toBeDefined();
    expect(deletedIngredient._id.toString()).toBe(ingredientId);
    expect(deletedIngredient.name).toBe('Cà chua');

    // Verify ingredient is deleted from database
    const foundIngredient = await IngredientModel.findById(ingredientId);
    expect(foundIngredient).toBeNull();
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      IngredientService.deleteIngredient('invalid-id')
    ).rejects.toThrow('Định dạng ID nguyên liệu không hợp lệ');
  });

  // Branch - Ingredient not found
  it('should throw error when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      IngredientService.deleteIngredient(nonExistentId)
    ).rejects.toThrow('Không tìm thấy nguyên liệu');
  });
});
