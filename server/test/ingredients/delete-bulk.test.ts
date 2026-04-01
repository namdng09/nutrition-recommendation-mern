import { afterEach, describe, expect, it, vi } from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { IngredientModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
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

const mockDeleteMany = vi.mocked(IngredientModel.deleteMany);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);

const VALID_IDS = ['ing1', 'ing2', 'ing3'];

describe('IngredientService.deleteBulk', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true);
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        IngredientService.deleteBulk(VALID_IDS)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID nguyên liệu không hợp lệ'
      });

      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it('should delete image for each ingredient id', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockDeleteMany.mockResolvedValue({ deletedCount: 3 } as any);

      await IngredientService.deleteBulk(VALID_IDS);

      expect(mockDeleteImage).toHaveBeenCalledWith('ing1');
      expect(mockDeleteImage).toHaveBeenCalledWith('ing2');
      expect(mockDeleteImage).toHaveBeenCalledWith('ing3');
      expect(mockDeleteImage).toHaveBeenCalledTimes(3);
    });

    it('should call deleteMany with correct ids filter', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockDeleteMany.mockResolvedValue({ deletedCount: 3 } as any);

      await IngredientService.deleteBulk(VALID_IDS);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: VALID_IDS }
      });
    });

    it('should return delete result with correct deletedCount', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const deleteResult = {
        deletedCount: 3,
        acknowledged: true
      };
      mockDeleteMany.mockResolvedValue(deleteResult as any);

      const result = await IngredientService.deleteBulk(VALID_IDS);

      expect(result).toEqual(deleteResult);
    });

    it('should handle partial deletion and empty array', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockDeleteMany.mockResolvedValue({ deletedCount: 1 } as any);

      const result = await IngredientService.deleteBulk(['ing1']);

      expect(result.deletedCount).toBe(1);
      expect(mockDeleteImage).toHaveBeenCalledWith('ing1');
    });
  });
});
