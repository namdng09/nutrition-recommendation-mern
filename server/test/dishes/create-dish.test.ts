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

import { DishService } from '~/features/dishes/dish-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { UNIT } from '~/shared/constants/unit';
import { DishModel, IngredientModel } from '~/shared/database/models';

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg',
      public_id: 'test-dish',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('DishService.createDish', () => {
  let ingredientId: string;
  const userId = new mongoose.Types.ObjectId().toString();
  const userName = 'Test User';

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
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg',
        public_id: 'test-dish',
        format: 'jpg'
      } as any
    });

    // Create test ingredient
    const ingredient = await IngredientModel.create({
      name: 'Thịt bò',
      description: 'Thịt bò Úc',
      categories: [INGREDIENT_CATEGORY.MEAT],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      isActive: true
    });
    ingredientId = ingredient._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should create dish successfully', async () => {
    const dishData = {
      name: 'Bún chả',
      description: 'Bún chả Hà Nội',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Ướp thịt' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN],
      isActive: true
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'test-dish.jpg'
    } as Express.Multer.File;

    const dish = await DishService.createDish(
      userId,
      userName,
      dishData as any,
      fakeImage
    );

    expect(dish).toBeDefined();
    expect(dish.name).toBe('Bún chả');
    expect(dish.image).toBeDefined();
    expect(dish.image).toContain('https://res.cloudinary.com');
  });

  // Branch - Invalid constant value
  it('should throw error when category value is invalid', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: ['invalid-category'],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Danh mục món ăn không hợp lệ');
  });

  // Branch - Missing required field
  it('should throw error when name is missing', async () => {
    const dishData = {
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Tên món ăn không hợp lệ');
  });

  // Branch - Name too short
  it('should throw error when name is too short', async () => {
    const dishData = {
      name: 'A',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Tên món ăn phải có ít nhất 2 ký tự');
  });

  // Branch - Name is not a string
  it('should throw error when name is not a string', async () => {
    const dishData = {
      name: 123,
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Tên món ăn không hợp lệ');
  });

  // Branch - Ingredient does not exist
  it('should throw error when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const dishData = {
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: nonExistentId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Không tìm thấy nguyên liệu');
  });

  // Branch - Invalid ingredient id format
  it('should throw error when ingredient ID format is invalid', async () => {
    const dishData = {
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: 'invalid-id',
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow(
      `ID nguyên liệu không hợp lệ: ${dishData.ingredients[0].ingredientId}`
    );
  });

  // Branch - Duplicate dish name
  it('should throw error when dish name already exists', async () => {
    // Create a dish with specific name
    await DishModel.create({
      user: { _id: userId, name: userName },
      name: 'Cơm chiên dứa',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Rang cơm' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    });

    // Try to create another dish with the same name
    const dishData = {
      name: 'Cơm chiên dứa',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Rang cơm' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    await expect(
      DishService.createDish(userId, userName, dishData as any, undefined)
    ).rejects.toThrow('Món ăn với tên này đã tồn tại');
  });

  // Branch - Image upload fails
  it('should throw error when image upload fails', async () => {
    // Mock uploadImage to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const dishData = {
      name: 'Phở bò',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'test-dish.jpg'
    } as Express.Multer.File;

    await expect(
      DishService.createDish(userId, userName, dishData as any, fakeImage)
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });
});
