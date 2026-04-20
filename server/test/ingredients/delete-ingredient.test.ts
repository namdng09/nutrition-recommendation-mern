import { afterEach, describe, expect, it, vi } from 'vitest';

import { IngredientService } from '~/features/ingredients/ingredient-service';
import { IngredientModel } from '~/shared/database/models';
import { deleteImage, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  IngredientModel: {
    findById: vi.fn()
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
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockDeleteImage = vi.mocked(deleteImage);
const mockDeleteOne = vi.fn();

const VALID_ID = 'abc123';
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
