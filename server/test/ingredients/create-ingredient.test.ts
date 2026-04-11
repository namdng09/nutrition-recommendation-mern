import { afterEach, describe, expect, it, vi } from 'vitest';

import { createIngredientRequestSchema } from '~/features/ingredients/ingredient-dto';
import { IngredientService } from '~/features/ingredients/ingredient-service';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';
import { IngredientModel } from '~/shared/database/models';
import { uploadImage } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindOne = vi.mocked(IngredientModel.findOne);
const mockCreate = vi.mocked(IngredientModel.create);
const mockUploadImage = vi.mocked(uploadImage);

const validData = {
  name: 'Thịt bò',
  description: 'Thịt bò Úc',
  categories: [INGREDIENT_CATEGORY.MEAT],
  baseUnit: { amount: 100, unit: UNIT.GRAM },
  allergens: []
};

describe('IngredientService.createIngredient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is missing', () => {
      const { name: _, ...data } = validData;
      const result = createIngredientRequestSchema.safeParse(data);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên nguyên liệu không hợp lệ'
      );
    });

    it('should fail when name is too short', () => {
      const result = createIngredientRequestSchema.safeParse({
        ...validData,
        name: 'A'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên nguyên liệu phải có ít nhất 2 ký tự'
      );
    });

    it('should fail when category is invalid', () => {
      const result = createIngredientRequestSchema.safeParse({
        ...validData,
        categories: ['invalid-category']
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Danh mục nguyên liệu không hợp lệ'
      );
    });

    it('should fail when baseUnit is negative', () => {
      const result = createIngredientRequestSchema.safeParse({
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
    it('should throw 409 when ingredient name already exists', async () => {
      mockFindOne.mockResolvedValue({ name: validData.name } as any);

      await expect(
        IngredientService.createIngredient(validData)
      ).rejects.toMatchObject({
        status: 409,
        message: 'Nguyên liệu với tên này đã tồn tại'
      });
    });

    it('should create ingredient successfully without image', async () => {
      const mockIngredient = {
        _id: { toString: () => 'abc123' },
        ...validData,
        image: ''
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockIngredient as any);

      const result = await IngredientService.createIngredient(validData);

      expect(result).toEqual(mockIngredient);
    });

    it('should create ingredient successfully with image', async () => {
      const mockSave = vi.fn();
      const mockIngredient = {
        _id: { toString: () => 'abc123' },
        ...validData,
        image: '',
        save: mockSave
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockIngredient as any);
      mockUploadImage.mockResolvedValue({
        success: true,
        data: {
          secure_url:
            'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg'
        }
      } as any);

      const fakeImage = {
        buffer: Buffer.from('fake-image-data')
      } as Express.Multer.File;

      const result = await IngredientService.createIngredient(
        validData,
        fakeImage
      );

      expect(mockIngredient.image).toBe(
        'https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg'
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockIngredient);
    });
  });
});
