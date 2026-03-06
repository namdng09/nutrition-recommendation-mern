import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { findOneAndDelete: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockFindOneAndDelete = vi.mocked(GroceryModel.findOneAndDelete);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const GROCERY_ID = 'grocery123';
const mockGrocery = {
  _id: { toString: () => GROCERY_ID },
  name: 'Danh sách tuần 1',
  user: { _id: USER_ID, name: 'Nguyen Van A' }
};

describe('GroceryService.deleteGrocery', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        GroceryService.deleteGrocery('invalid-id', GROCERY_ID)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when groceryId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.deleteGrocery(USER_ID, 'invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOneAndDelete.mockResolvedValue(null);

      await expect(
        GroceryService.deleteGrocery(USER_ID, GROCERY_ID)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should delete grocery successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOneAndDelete.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.deleteGrocery(USER_ID, GROCERY_ID);

      expect(result).toEqual(mockGrocery);
      expect(mockFindOneAndDelete).toHaveBeenCalledWith({
        _id: GROCERY_ID,
        'user._id': USER_ID
      });
    });
  });
});
