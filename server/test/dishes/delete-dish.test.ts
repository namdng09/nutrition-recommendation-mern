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
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { ROLE } from '~/shared/constants/role';
import { DishModel } from '~/shared/database/models';

// Mock Cloudinary
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
      public_id: 'test',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('DishService.deleteDish', () => {
  let dishId: string;
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    await DishModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

    // Create test dish with user info
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
    await DishModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should delete dish successfully', async () => {
    const deletedDish = await DishService.deleteDish(dishId, userId, ROLE.USER);

    expect(deletedDish).toBeDefined();
    expect(deletedDish._id.toString()).toBe(dishId);
    expect(deletedDish.name).toBe('Phở bò');

    // Verify dish is deleted from database
    const dish = await DishModel.findById(dishId);
    expect(dish).toBeNull();
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      DishService.deleteDish('invalid-id', userId, ROLE.USER)
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Dish not found
  it('should throw error when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      DishService.deleteDish(nonExistentId, userId, ROLE.USER)
    ).rejects.toThrow('Không tìm thấy món ăn');
  });

  // Branch - Permission denied - user is not owner
  it('should throw error when non-owner tries to delete', async () => {
    await expect(
      DishService.deleteDish(dishId, otherUserId, ROLE.USER)
    ).rejects.toThrow('Bạn không có quyền xóa món ăn này');
  });

  // Branch - Admin can delete any dish
  it('should allow admin to delete any dish', async () => {
    const deletedDish = await DishService.deleteDish(
      dishId,
      otherUserId,
      ROLE.ADMIN
    );

    expect(deletedDish).toBeDefined();
    expect(deletedDish._id.toString()).toBe(dishId);

    const dish = await DishModel.findById(dishId);
    expect(dish).toBeNull();
  });
});
