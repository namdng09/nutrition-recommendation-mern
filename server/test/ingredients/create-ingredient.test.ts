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

// Mock Cloudinary upload
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

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('IngredientService.createIngredient', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await IngredientModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg',
        public_id: 'test-image',
        format: 'jpg'
      } as any
    });
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
  it('should create ingredient successfully', async () => {
    const ingredientData = {
      name: 'Thịt bò',
      description: 'Thịt bò Úc',
      categories: [INGREDIENT_CATEGORY.MEAT],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'test-image.jpg'
    } as Express.Multer.File;

    const ingredient = await IngredientService.createIngredient(
      ingredientData,
      fakeImage
    );

    expect(ingredient).toBeDefined();
    expect(ingredient.name).toBe('Thịt bò');
    expect(ingredient.image).toBeDefined();
    expect(ingredient.image).toContain('https://res.cloudinary.com');
  });

  // Branch - Missing name
  it('should throw error when name is missing', async () => {
    const ingredientData = {
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    await expect(
      IngredientService.createIngredient(ingredientData as any, undefined)
    ).rejects.toThrow('Tên nguyên liệu không hợp lệ');
  });

  // Branch - Invalid name type
  it('should throw error when name is not a string', async () => {
    const ingredientData = {
      name: 1234,
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    await expect(
      IngredientService.createIngredient(ingredientData as any, undefined)
    ).rejects.toThrow('Tên nguyên liệu không hợp lệ');
  });

  // Branch - Name too short
  it('should throw error when name is too short', async () => {
    const ingredientData = {
      name: 'A',
      description: 'Cà chua tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    await expect(
      IngredientService.createIngredient(ingredientData as any, undefined)
    ).rejects.toThrow('Tên nguyên liệu phải có ít nhất 2 ký tự');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock uploadImage to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const ingredientData = {
      name: 'Cá hồi',
      description: 'Cá hồi Na Uy',
      categories: [INGREDIENT_CATEGORY.SEAFOOD],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'test-image.jpg'
    } as Express.Multer.File;

    await expect(
      IngredientService.createIngredient(ingredientData, fakeImage)
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });

  // Branch - Duplicate name
  it('should throw error when ingredient name already exists', async () => {
    await IngredientModel.create({
      name: 'Thịt gà',
      description: 'Thịt gà tươi',
      categories: [INGREDIENT_CATEGORY.MEAT],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    });

    // Create another ingredient with same name
    const ingredientData = {
      name: 'Thịt gà',
      description: 'Thịt gà khác',
      categories: [INGREDIENT_CATEGORY.MEAT],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: []
    };

    await expect(
      IngredientService.createIngredient(ingredientData, undefined)
    ).rejects.toThrow('Nguyên liệu với tên này đã tồn tại');
  });
});
