import { afterEach, describe, expect, it, vi } from 'vitest';

import { updatePrivateDishRequestSchema } from '~/features/dishes/dish-dto';
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

const mockFindById = vi.mocked(DishModel.findById);
const mockFindOne = vi.mocked(DishModel.findOne);
const mockFindByIdAndUpdate = vi.mocked(DishModel.findByIdAndUpdate);
const mockFindByIdIngredient = vi.mocked(IngredientModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadImage = vi.mocked(uploadImage);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'dish123';
const userId = 'user123';
const validData = {
  name: 'Phở bò private đặc biệt',
  description: 'Phở bò private với topping đầy đủ'
};

describe('DishService.updatePrivateDish', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is too short', () => {
      const result = updatePrivateDishRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên món ăn phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when category is invalid', () => {
      const result = updatePrivateDishRequestSchema.safeParse({
        ...validData,
        categories: ['invalid-category']
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Danh mục món ăn không hợp lệ'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        DishService.updatePrivateDish('invalid-id', userId, validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID món ăn không hợp lệ'
      });
    });

    it('should throw 404 when dish does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        DishService.updatePrivateDish(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy món ăn'
      });
    });

    it('should throw 403 when dish is public', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        isPublic: true,
        user: { _id: { toString: () => userId } }
      } as any);

      await expect(
        DishService.updatePrivateDish(VALID_ID, userId, validData as any)
      ).rejects.toMatchObject({
        status: 403,
        message: 'Bạn không có quyền cập nhật món ăn này'
      });
    });

    it('should throw 409 when updating to a name that already exists', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOne.mockResolvedValue({ name: validData.name } as any);

      await expect(
        DishService.updatePrivateDish(VALID_ID, userId, {
          name: validData.name
        } as any)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Món ăn với tên này đã tồn tại'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOne.mockResolvedValue(null);
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
        DishService.updatePrivateDish(
          VALID_ID,
          userId,
          updateDataWithIngredient as any
        )
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu với ID: ing123'
      });
    });

    it('should update private dish successfully without image', async () => {
      const mockDish = {
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } },
        ...validData
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(mockDish as any);

      const result = await DishService.updatePrivateDish(
        VALID_ID,
        userId,
        validData as any
      );

      expect(result).toEqual(mockDish);
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should update private dish successfully with image', async () => {
      const mockSave = vi.fn();
      const mockDish = {
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } },
        ...validData,
        image: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => VALID_ID },
        isPublic: false,
        user: { _id: { toString: () => userId } }
      } as any);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(mockDish as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/test-private-update.jpg'
        }
      } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      const result = await DishService.updatePrivateDish(
        VALID_ID,
        userId,
        validData as any,
        fakeImage
      );

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockUploadImage).toHaveBeenCalledWith(fakeImage.buffer, VALID_ID);
      expect(mockDish.image).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-private-update.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockDish);
    });
  });
});
