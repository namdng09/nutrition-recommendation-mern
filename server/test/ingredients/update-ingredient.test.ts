import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateIngredientRequestSchema } from '~/features/ingredients/ingredient-dto';
import { IngredientService } from '~/features/ingredients/ingredient-service';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';
import { deleteImage, uploadImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn()
  },
  DishModel: {
    updateMany: vi.fn()
  },
  GroceryModel: {
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

const mockFindOne = vi.mocked(IngredientModel.findOne);
const mockFindByIdAndUpdate = vi.mocked(IngredientModel.findByIdAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadImage = vi.mocked(uploadImage);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_ID = 'abc123';
const validData = { name: 'Cà chua cherry', description: 'Cà chua bi' };

describe('IngredientService.updateIngredient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is too short', () => {
      const result = updateIngredientRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên nguyên liệu phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when category is invalid', () => {
      const result = updateIngredientRequestSchema.safeParse({
        ...validData,
        categories: ['invalid-category']
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Danh mục nguyên liệu không hợp lệ'
      );
    });

    it('should fail when baseUnit is negative', () => {
      const result = updateIngredientRequestSchema.safeParse({
        ...validData,
        baseUnit: { amount: -100, unit: UNIT.GRAM }
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Số lượng cơ bản không được âm'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        IngredientService.updateIngredient('invalid-id', validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });
    });

    it('should throw 409 when updating to a name that already exists', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue({ name: 'Khoai tây' } as any);

      await expect(
        IngredientService.updateIngredient(VALID_ID, { name: 'Khoai tây' })
      ).rejects.toMatchObject({
        status: 409,
        message: 'Nguyên liệu với tên này đã tồn tại'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(
        IngredientService.updateIngredient(VALID_ID, validData)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu'
      });
    });

    it('should update ingredient successfully', async () => {
      const mockSave = vi.fn();
      const mockIngredient = {
        _id: { toString: () => VALID_ID },
        ...validData,
        image: '',
        save: mockSave
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);
      mockFindByIdAndUpdate.mockResolvedValue(mockIngredient as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg'
        }
      } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      const result = await IngredientService.updateIngredient(
        VALID_ID,
        validData,
        fakeImage
      );

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockUploadImage).toHaveBeenCalledWith(fakeImage.buffer, VALID_ID);
      expect(mockIngredient.image).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/updated-image.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockIngredient);
    });
  });
});
