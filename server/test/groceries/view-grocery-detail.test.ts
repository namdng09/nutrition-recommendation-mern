import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { findOne: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const GROCERY_ID = 'grocery123';
const mockGrocery = {
  _id: { toString: () => GROCERY_ID },
  name: 'Danh sách tuần 1',
  user: { _id: USER_ID, name: 'Nguyen Van A' },
  ingredients: []
};

describe('GroceryService.viewGroceryDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        GroceryService.viewGroceryDetail('invalid-id', GROCERY_ID)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when groceryId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.viewGroceryDetail(USER_ID, 'invalid-id')
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(null);

      await expect(
        GroceryService.viewGroceryDetail(USER_ID, GROCERY_ID)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should return grocery detail successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOne.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.viewGroceryDetail(
        USER_ID,
        GROCERY_ID
      );

      expect(result).toEqual(mockGrocery);
      expect(mockFindOne).toHaveBeenCalledWith({
        _id: GROCERY_ID,
        'user._id': USER_ID
      });
    });
  });
});
