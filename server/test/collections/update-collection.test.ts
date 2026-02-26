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

import { CollectionService } from '~/features/collections/collection-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';
import { CollectionModel, DishModel } from '~/shared/database/models';

// Mock Cloudinary upload
vi.mock('~/shared/utils/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    success: true,
    data: {
      secure_url:
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-collection.jpg',
      public_id: 'updated-collection',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('CollectionService.updateCollection', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  let collectionId: string;
  let dishId: string;

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
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-collection.jpg',
        public_id: 'updated-collection',
        format: 'jpg'
      } as any
    });

    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      description: 'Phở bò truyền thống',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(),
          name: 'Thịt bò',
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [{ step: 1, description: 'Luộc xương' }],
      isActive: true
    });
    dishId = dish._id.toString();

    // Create test collection
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: false,
      dishes: [],
      tags: ['giảm cân']
    });
    collectionId = collection._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await CollectionModel.deleteMany({});
    await DishModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case: update collection successfully
  it('should update collection successfully', async () => {
    const updateData = {
      name: 'Món ăn giảm cân hiệu quả',
      description: 'Bộ sưu tập các món ăn giúp giảm cân nhanh chóng',
      isPublic: true,
      tags: ['giảm cân', 'healthy', 'low-carb']
    };

    const updatedCollection = await CollectionService.updateCollection(
      collectionId,
      userId,
      updateData,
      undefined
    );

    expect(updatedCollection).toBeDefined();
    expect(updatedCollection._id.toString()).toBe(collectionId);
    expect(updatedCollection.name).toBe('Món ăn giảm cân hiệu quả');
    expect(updatedCollection.description).toBe(
      'Bộ sưu tập các món ăn giúp giảm cân nhanh chóng'
    );
    expect(updatedCollection.isPublic).toBe(true);
    expect(updatedCollection.tags).toContain('giảm cân');
    expect(updatedCollection.tags).toContain('healthy');
    expect(updatedCollection.tags).toContain('low-carb');
  });

  // Branch - Unauthorized user
  it('should throw error when updating collection of another user', async () => {
    const updateData = {
      name: 'Món ăn mới'
    };

    await expect(
      CollectionService.updateCollection(
        collectionId,
        otherUserId,
        updateData,
        undefined
      )
    ).rejects.toThrow('Bạn không có quyền cập nhật bộ sưu tập này');
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    const updateData = {
      name: 'Món ăn mới'
    };

    await expect(
      CollectionService.updateCollection(
        'invalid-id',
        userId,
        updateData,
        undefined
      )
    ).rejects.toThrow('Định dạng ID bộ sưu tập không hợp lệ');
  });

  // Branch - Collection not found
  it('should throw error when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Món ăn mới'
    };

    await expect(
      CollectionService.updateCollection(
        nonExistentId,
        userId,
        updateData,
        undefined
      )
    ).rejects.toThrow('Không tìm thấy bộ sưu tập');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    } as any);

    const updateData = {
      name: 'Món ăn mới'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'updated-collection.jpg'
    } as Express.Multer.File;

    await expect(
      CollectionService.updateCollection(
        collectionId,
        userId,
        updateData,
        fakeImage
      )
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });

  // Branch - Update with invalid dish ID format
  it('should throw error when updating with invalid dish ID format', async () => {
    const updateData = {
      name: 'Món ăn Việt',
      dishes: ['invalid-id']
    };

    await expect(
      CollectionService.updateCollection(
        collectionId,
        userId,
        updateData,
        undefined
      )
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Update with non-existent dish
  it('should throw error when updating with non-existent dish', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Món ăn Việt',
      dishes: [nonExistentDishId]
    };

    await expect(
      CollectionService.updateCollection(
        collectionId,
        userId,
        updateData,
        undefined
      )
    ).rejects.toThrow('Một hoặc nhiều món ăn không tồn tại');
  });
});
