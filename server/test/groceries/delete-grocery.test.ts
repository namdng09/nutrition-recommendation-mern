import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    findOneAndDelete: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindOneAndDelete = vi.mocked(GroceryModel.findOneAndDelete);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const groceryId = '507f1f77bcf86cd799439011';

describe('GroceryService.deleteGrocery (UC32)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when grocery id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      GroceryService.deleteGrocery(userId, 'invalid-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID danh sách mua sắm không hợp lệ'
    });
  });

  it('should throw 404 when grocery does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindOneAndDelete.mockResolvedValue(null);

    await expect(
      GroceryService.deleteGrocery(userId, groceryId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy danh sách mua sắm'
    });
  });

  it('should delete grocery successfully', async () => {
    const mockGrocery = {
      _id: groceryId,
      name: 'Danh sach 1',
      user: { _id: userId, name: 'User' }
    };

    mockValidateObjectId.mockReturnValue(true);
    mockFindOneAndDelete.mockResolvedValue(mockGrocery as any);

    const result = await GroceryService.deleteGrocery(userId, groceryId);

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: groceryId,
      'user._id': userId
    });
    expect(result).toEqual(mockGrocery);
  });
});
