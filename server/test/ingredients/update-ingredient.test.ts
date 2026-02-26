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
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg',
      public_id: 'updated-image',
      format: 'jpg'
    }
  }),
  deleteImage: vi.fn().mockResolvedValue({ success: true })
}));

// Import mocked functions to customize per test
import * as cloudinaryUtils from '~/shared/utils/cloudinary';

describe('IngredientService.updateIngredient', () => {
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
    await IngredientModel.deleteMany({});

    // Reset mocks
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValue({
      success: true,
      data: {
        secure_url:
          'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg',
        public_id: 'updated-image',
        format: 'jpg'
      } as any
    });

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
  it('should update ingredient successfully', async () => {
    const updateData = {
      name: 'Cà chua cherry',
      description: 'Cà chua bi'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'updated-image.jpg'
    } as Express.Multer.File;

    const updatedIngredient = await IngredientService.updateIngredient(
      ingredientId,
      updateData,
      fakeImage
    );

    expect(updatedIngredient).toBeDefined();
    expect(updatedIngredient.name).toBe('Cà chua cherry');
    expect(updatedIngredient.image).toBeDefined();
    expect(updatedIngredient.image).toContain('https://res.cloudinary.com');
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    const updateData = {
      name: 'Cà chua đỏ'
    };

    await expect(
      IngredientService.updateIngredient('invalid-id', updateData, undefined)
    ).rejects.toThrow('Định dạng ID nguyên liệu không hợp lệ');
  });

  // Branch - Invalid name type
  it('should throw error when name is not a string', async () => {
    const updateData = {
      name: 1234
    } as any;

    await expect(
      IngredientService.updateIngredient(ingredientId, updateData, undefined)
    ).rejects.toThrow('Tên nguyên liệu không hợp lệ');
  });

  // Branch - Name too short
  it('should throw error when name is too short', async () => {
    const updateData = {
      name: 'A'
    };

    await expect(
      IngredientService.updateIngredient(ingredientId, updateData, undefined)
    ).rejects.toThrow('Tên nguyên liệu phải có ít nhất 2 ký tự');
  });

  // Branch - Ingredient not found
  it('should throw error when ingredient does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      name: 'Cà chua đỏ'
    };

    await expect(
      IngredientService.updateIngredient(nonExistentId, updateData, undefined)
    ).rejects.toThrow('Không tìm thấy nguyên liệu');
  });

  // Branch - Image upload failure
  it('should throw error when image upload fails', async () => {
    // Mock uploadImage to fail
    vi.mocked(cloudinaryUtils.uploadImage).mockResolvedValueOnce({
      success: false,
      data: null
    } as any);

    const updateData = {
      name: 'Cà chua chín'
    };

    const fakeImage = {
      buffer: Buffer.from('fake-image-data'),
      originalname: 'updated-image.jpg'
    } as Express.Multer.File;

    await expect(
      IngredientService.updateIngredient(ingredientId, updateData, fakeImage)
    ).rejects.toThrow('Tải ảnh lên thất bại');
  });

  // Branch - Duplicate name
  it('should throw error when updating to a name that already exists', async () => {
    // Create another ingredient
    await IngredientModel.create({
      name: 'Khoai tây',
      description: 'Khoai tây tươi',
      categories: [INGREDIENT_CATEGORY.VEGETABLES],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      allergens: [],
      isActive: true
    });

    // Try to update the first ingredient with name of second ingredient
    const updateData = {
      name: 'Khoai tây'
    };

    await expect(
      IngredientService.updateIngredient(ingredientId, updateData, undefined)
    ).rejects.toThrow('Nguyên liệu với tên này đã tồn tại');
  });
});
