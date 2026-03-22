import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateDishRequestSchema } from '~/features/dishes/dish-dto';
import { DishService } from '~/features/dishes/dish-service';
import { DishModel, IngredientModel } from '~/shared/database/models';
import { deleteImage, uploadImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  DishModel: {
    findById: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn()
  },
  IngredientModel: {
    findById: vi.fn()
  },
  CollectionModel: {
    updateMany: vi.fn()
  },
  ScheduleModel: {
    updateMany: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindOneDish = vi.mocked(DishModel.findOne);
const mockFindByIdDish = vi.mocked(DishModel.findById);
const mockFindByIdAndUpdateDish = vi.mocked(DishModel.findByIdAndUpdate);
const mockFindByIdIngredient = vi.mocked(IngredientModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadImage = vi.mocked(uploadImage);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'dish123';
const userId = 'user123';
const validData = {
  name: 'Phở bò đặc biệt',
  description: 'Phở bò với topping đầy đủ'
};

describe('DishService.updateDish', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    // Tests DTO schema directly — no service, no DB involved

    it('should fail when name is not a string', () => {
      const result = updateDishRequestSchema.safeParse({ name: 1234 });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Tên món ăn không hợp lệ');
    });

    it('should fail when name is too short', () => {
      const result = updateDishRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên món ăn phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.updateDish('invalid-id', userId, validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(null);

      await expect(
        DishService.updateDish(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when user is not the owner', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const mockDish = {
        _id: { toString: () => VALID_ID },
        user: { _id: 'other-user-123' }
      };
      mockFindByIdDish.mockResolvedValue(mockDish as any);

      await expect(
        DishService.updateDish(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền cập nhật món ăn này'
      });
    });

    it('should throw 409 when updating to a name that already exists', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOneDish.mockResolvedValue({ name: validData.name } as any);

      await expect(
        DishService.updateDish(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Món ăn với tên này đã tồn tại'
      });
    });

    it('should update dish successfully', async () => {
      const mockDish = {
        _id: { toString: () => VALID_ID },
        user: { _id: { toString: () => userId } },
        name: validData.name,
        image: '',
        save: vi.fn()
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);
      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdAndUpdateDish.mockResolvedValue(mockDish as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg'
        }
      } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      const result = await DishService.updateDish(
        VALID_ID,
        userId,
        validData as any,
        fakeImage
      );

      expect(result).toBeDefined();
      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdIngredient.mockResolvedValue(null);

      const updateDataWithIngredient = {
        ...validData,
        ingredients: [
          {
            ingredientId: 'ing123',
            units: [{ value: 200, quantity: 1, unit: 'g', isDefault: true }]
          }
        ]
      };

      await expect(
        DishService.updateDish(
          VALID_ID,
          userId,
          updateDataWithIngredient as any
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu với ID: ing123'
      });
    });
  });

  describe('system', () => {
    it('should throw 500 when image upload fails', async () => {
      const mockDish = {
        _id: { toString: () => VALID_ID },
        user: { _id: { toString: () => userId } },
        name: validData.name,
        image: '',
        save: vi.fn()
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindByIdDish.mockResolvedValue(mockDish as any);
      mockFindOneDish.mockResolvedValue(null);
      mockFindByIdAndUpdateDish.mockResolvedValue(mockDish as any);
      mockUploadImage.mockResolvedValue({ success: false, data: null } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      await expect(
        DishService.updateDish(VALID_ID, userId, validData as any, fakeImage)
      ).rejects.toMatchObject({
        status: 500,
        message: 'Tải ảnh lên thất bại'
      });
    });
  });
});
