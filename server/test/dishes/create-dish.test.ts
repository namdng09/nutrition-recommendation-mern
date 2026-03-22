import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDishRequestSchema } from '~/features/dishes/dish-dto';
import { DishService } from '~/features/dishes/dish-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { UNIT } from '~/shared/constants/unit';
import { DishModel, IngredientModel } from '~/shared/database/models';
import { uploadImage } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findOne: vi.fn(),
    create: vi.fn()
  },
  IngredientModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
    validateObjectId: vi.fn(() => true)
  };
});

const mockFindOneDish = vi.mocked(DishModel.findOne);
const mockCreateDish = vi.mocked(DishModel.create);
const mockFindByIdIngredient = vi.mocked(IngredientModel.findById);
const mockUploadImage = vi.mocked(uploadImage);

const validData = {
  name: 'Phở bò',
  description: 'Phở bò truyền thống Hà Nội',
  categories: [DISH_CATEGORY.MAIN_COURSE],
  ingredients: [
    {
      ingredientId: '507f1f77bcf86cd799439011',
      units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
    }
  ],
  instructions: [{ step: 1, description: 'Luộc xương' }],
  nutritionFocus: [NUTRITION_FOCUS.HIGH_PROTEIN],
  servings: 2
};

const mockIngredient = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Thịt bò',
  description: 'Thịt bò Úc',
  image: 'beef.jpg',
  allergens: [],
  baseUnit: { amount: 100, unit: UNIT.GRAM }
};

describe('DishService.createDish', () => {
  const userId = 'user123';
  const userName = 'Test User';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    // Tests DTO schema directly — no service, no DB involved

    it('should fail when name is missing', () => {
      const { name: _, ...data } = validData;
      const result = createDishRequestSchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tên món ăn không hợp lệ');
    });

    it('should fail when name is too short', () => {
      const result = createDishRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên món ăn phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when name is not a string', () => {
      const result = createDishRequestSchema.safeParse({
        ...validData,
        name: 123
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tên món ăn không hợp lệ');
    });
  });

  describe('business logic', () => {
    it('should throw 409 when dish name already exists', async () => {
      mockFindOneDish.mockResolvedValue({ name: validData.name } as any);

      await expect(
        DishService.createDish(userId, userName, validData as any)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Món ăn với tên này đã tồn tại'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdIngredient.mockResolvedValue(null);

      await expect(
        DishService.createDish(userId, userName, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu với ID: 507f1f77bcf86cd799439011'
      });
    });

    it('should create dish successfully without image', async () => {
      const mockSave = vi.fn();
      const mockDish = {
        _id: { toString: () => 'dish123' },
        ...validData,
        user: { _id: userId, name: userName },
        image: '',
        save: mockSave
      };

      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdIngredient.mockResolvedValue(mockIngredient as any);
      mockCreateDish.mockResolvedValue(mockDish as any);

      const result = await DishService.createDish(
        userId,
        userName,
        validData as any
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(validData.name);
      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should create dish successfully with image', async () => {
      const mockSave = vi.fn();
      const mockDish = {
        _id: { toString: () => 'dish123' },
        ...validData,
        user: { _id: userId, name: userName },
        image: '',
        save: mockSave
      };

      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdIngredient.mockResolvedValue(mockIngredient as any);
      mockCreateDish.mockResolvedValue(mockDish as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg'
        }
      } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      const result = await DishService.createDish(
        userId,
        userName,
        validData as any,
        fakeImage
      );

      expect(mockDish.image).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-dish.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('system', () => {
    it('should throw 500 when image upload fails', async () => {
      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdIngredient.mockResolvedValue(mockIngredient as any);
      mockCreateDish.mockResolvedValue({
        _id: { toString: () => 'dish123' },
        ...validData,
        user: { _id: userId, name: userName },
        save: vi.fn()
      } as any);
      mockUploadImage.mockResolvedValue({ success: false, data: null } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      await expect(
        DishService.createDish(userId, userName, validData as any, fakeImage)
      ).rejects.toMatchObject({
        status: 500,
        message: 'Tải ảnh lên thất bại'
      });
    });
  });
});
