import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteBulkRequestSchema } from '~/features/ingredients/ingredient-dto';
import { IngredientService } from '~/features/ingredients/ingredient-service';
import { IngredientModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
    findById: vi.fn(),
    deleteMany: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    deleteImage: vi.fn()
  };
});

const mockFindById = vi.mocked(IngredientModel.findById);
const mockDeleteMany = vi.mocked(IngredientModel.deleteMany);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);
const mockDeleteOne = vi.fn();

const VALID_ID = 'abc123';
const VALID_IDS = ['id1', 'id2'];
const mockIngredient = {
  _id: { toString: () => VALID_ID },
  name: 'Cà chua',
  image: 'https://res.cloudinary.com/test/image/upload/v1234567890/image.jpg',
  deleteOne: mockDeleteOne
};

describe('IngredientService.deleteIngredient', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockDeleteOne.mockClear();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        IngredientService.deleteIngredient('invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });
    });

    it('should throw 404 when ingredient does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(null);

      await expect(
        IngredientService.deleteIngredient(VALID_ID)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nguyên liệu'
      });
    });

    it('should delete ingredient successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue(mockIngredient as any);
      mockDeleteImage.mockResolvedValue({ success: true });

      const result = await IngredientService.deleteIngredient(VALID_ID);

      expect(mockDeleteImage).toHaveBeenCalledWith(VALID_ID);
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(result._id.toString()).toBe(VALID_ID);
    });
  });
});

describe('IngredientService.deleteBulk', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when ids is empty array', () => {
      const result = deleteBulkRequestSchema.safeParse({ ids: [] });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Cần ít nhất một ID nguyên liệu'
      );
    });

    it('should fail when ids contains empty string', () => {
      const result = deleteBulkRequestSchema.safeParse({ ids: [''] });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'ID nguyên liệu không được để trống'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when ids contains invalid ObjectId', async () => {
      mockValidateObjectId.mockReturnValueOnce(true);
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        IngredientService.deleteBulk(['valid', 'bad-id'])
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });

      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it('should delete successfully when ids are valid', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockDeleteImage.mockResolvedValue({ success: true } as any);
      mockDeleteMany.mockResolvedValue({
        deletedCount: 2,
        acknowledged: true
      } as any);

      const result = await IngredientService.deleteBulk(VALID_IDS);

      expect(mockDeleteImage).toHaveBeenCalledTimes(2);
      expect(mockDeleteMany).toHaveBeenCalledWith({ _id: { $in: VALID_IDS } });
      expect(result.deletedCount).toBe(2);
    });
  });
});
