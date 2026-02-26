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
import { CollectionModel, DishModel } from '~/shared/database/models';

// Mock Cloudinary
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

describe('CollectionService.deleteCollection', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  let collectionId: string;
  let collectionWithImageId: string;

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
    vi.mocked(cloudinaryUtils.deleteImage).mockResolvedValue({ success: true });

    // Create test collections
    const collection = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn giảm cân',
      description: 'Bộ sưu tập các món ăn giảm cân',
      isPublic: false,
      dishes: []
    });
    collectionId = collection._id.toString();

    const collectionWithImage = await CollectionModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Món ăn tăng cơ',
      description: 'Bộ sưu tập các món ăn tăng cơ',
      isPublic: false,
      image:
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-collection.jpg',
      dishes: []
    });
    collectionWithImageId = collectionWithImage._id.toString();
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

  // Branch - Happy case: delete collection successfully
  it('should delete collection successfully', async () => {
    await CollectionService.deleteCollection(collectionWithImageId, userId);

    // Verify deleteImage was called
    expect(cloudinaryUtils.deleteImage).toHaveBeenCalledWith(
      collectionWithImageId
    );

    // Verify collection is deleted
    const deletedCollection = await CollectionModel.findById(
      collectionWithImageId
    );
    expect(deletedCollection).toBeNull();
  });

  // Branch - Unauthorized user
  it('should throw error when deleting collection of another user', async () => {
    await expect(
      CollectionService.deleteCollection(collectionId, otherUserId)
    ).rejects.toThrow('Bạn không có quyền xóa bộ sưu tập này');
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      CollectionService.deleteCollection('invalid-id', userId)
    ).rejects.toThrow('Định dạng ID bộ sưu tập không hợp lệ');
  });

  // Branch - Collection not found
  it('should throw error when collection does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      CollectionService.deleteCollection(nonExistentId, userId)
    ).rejects.toThrow('Không tìm thấy bộ sưu tập');
  });
});
