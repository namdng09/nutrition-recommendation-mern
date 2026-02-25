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
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
      public_id: 'test-collection',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('CollectionService.createCollection', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userName = 'Test User';
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
          'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
        public_id: 'test-collection',
        format: 'jpg'
      } as any
    });

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: userName },
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

  // Branch - Happy case: create collection successfully
  it('should create collection successfully successfully', async () => {
    const collectionData = {
      name: 'Món ăn Việt',
      description: 'Các món ăn truyền thống Việt Nam',
      dishes: [dishId]
    };

    const collection = await CollectionService.createCollection(
      userId,
      userName,
      collectionData,
      undefined
    );

    expect(collection).toBeDefined();
    expect(collection.name).toBe('Món ăn Việt');
    expect(collection.dishes).toHaveLength(1);
    expect(collection.dishes[0].dishId?.toString()).toBe(dishId);
    expect(collection.dishes[0].name).toBe('Phở bò');
  });

  // Branch - Invalid dish ID format
  it('should throw error when dish ID format is invalid', async () => {
    const collectionData = {
      name: 'Món ăn Việt',
      dishes: ['invalid-id']
    };

    await expect(
      CollectionService.createCollection(
        userId,
        userName,
        collectionData as any,
        undefined
      )
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Dish does not exist
  it('should throw error when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const collectionData = {
      name: 'Món ăn Việt',
      dishes: [nonExistentId]
    };

    await expect(
      CollectionService.createCollection(
        userId,
        userName,
        collectionData,
        undefined
      )
    ).rejects.toThrow('Một hoặc nhiều món ăn không tồn tại');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock upload to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    } as any);

    const collectionData = {
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập món ăn giảm cân'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'test-collection.jpg'
    } as Express.Multer.File;

    await expect(
      CollectionService.createCollection(
        userId,
        userName,
        collectionData,
        fakeImage
      )
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });
});
