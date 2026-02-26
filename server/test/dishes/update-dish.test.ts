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
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-dish.jpg',
      public_id: 'updated-dish',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('DishService.updateDish', () => {
  let userId: string;
  let dishId: string;
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
    // Clean up database before each test
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-dish.jpg',
        public_id: 'updated-dish',
        format: 'jpg'
      } as any
    });

    // Create test user ID
    userId = new mongoose.Types.ObjectId().toString();

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

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true,
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    });
    dishId = dish._id.toString();
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
  it('should update dish successfully', async () => {
    const updateData = {
      name: 'Phở bò đặc biệt',
      description: 'Phở bò với nhiều topping'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'updated-dish.jpg'
    } as Express.Multer.File;

    const updatedDish = await DishService.updateDish(
      dishId,
      userId,
      updateData as any,
      fakeImage
    );

    expect(updatedDish).toBeDefined();
    expect(updatedDish.name).toBe('Phở bò đặc biệt');
    expect(updatedDish.image).toBeDefined();
    expect(updatedDish.image).toContain('https://res.cloudinary.com');
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    await expect(
      DishService.updateDish('invalid-id', userId, updateData as any, undefined)
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Dish not found
  it('should throw error when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Phở bò Hà Nội'
    };

    await expect(
      DishService.updateDish(
        nonExistentId,
        userId,
        updateData as any,
        undefined
      )
    ).rejects.toThrow('Không tìm thấy món ăn');
  });

  // Branch - Invalid type (name is not a string)
  it('should throw error when name is not a string', async () => {
    const updateData = {
      name: 123
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('Tên món ăn không hợp lệ');
  });

  // Branch - Invalid constant value
  it('should throw error when category value is invalid', async () => {
    const updateData = {
      categories: ['invalid-category']
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('Danh mục món ăn không hợp lệ');
  });

  // Branch - Name too short
  it('should throw error when name is too short', async () => {
    const updateData = {
      name: 'A'
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('Tên món ăn phải có ít nhất 2 ký tự');
  });

  // Branch - Duplicate dish name
  it('should throw error when updating to a name that already exists', async () => {
    // Create another dish with a different name
    await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Bún phở',
      description: 'Bún phở thơm ngon',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [],
      instructions: [{ step: 1, description: 'Nấu nước dùng' }],
      isActive: true,
      nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN]
    });

    // Try to update the first dish to have the name of the second dish
    const updateData = {
      name: 'Bún phở'
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('Món ăn với tên này đã tồn tại');
  });

  // Branch - Invalid ingredient id format
  it('should throw error when ingredient ID format is invalid', async () => {
    const updateData = {
      ingredients: [
        {
          ingredientId: 'invalid-id',
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('ID nguyên liệu không hợp lệ: invalid-id');
  });

  // Branch - Ingredient does not exist
  it('should throw error when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      ingredients: [
        {
          ingredientId: nonExistentId,
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]
    };

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, undefined)
    ).rejects.toThrow('Không tìm thấy nguyên liệu');
  });

  // Branch - Permission check
  it('should throw error when user tries to update another user dish', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Updated Name'
    };

    await expect(
      DishService.updateDish(dishId, otherUserId, updateData as any, undefined)
    ).rejects.toThrow('Bạn không có quyền cập nhật món ăn này');
  });

  // Branch - Image upload fails
  it('should throw error when image upload fails during update', async () => {
    // Mock uploadImage to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const updateData = {
      name: 'Phở bò đặc biệt',
      description: 'Phở bò với nhiều topping'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'updated-dish.jpg'
    } as Express.Multer.File;

    await expect(
      DishService.updateDish(dishId, userId, updateData as any, fakeImage)
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });
});
