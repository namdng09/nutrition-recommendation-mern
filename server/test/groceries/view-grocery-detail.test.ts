import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    findOne: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindOne = vi.mocked(GroceryModel.findOne);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const groceryId = '507f1f77bcf86cd799439011';

describe('GroceryService.viewGroceryDetail (UC30)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when grocery id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      GroceryService.viewGroceryDetail(userId, 'invalid-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID danh sách mua sắm không hợp lệ'
    });
  });

  it('should throw 404 when grocery does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindOne.mockResolvedValue(null);

    await expect(
      GroceryService.viewGroceryDetail(userId, groceryId)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy danh sách mua sắm'
    });
  });

  it('should return grocery detail successfully', async () => {
    const mockGrocery = {
      _id: groceryId,
      name: 'Danh sach 1',
      user: { _id: userId, name: 'User' },
      ingredients: [
        { ingredientId: 'ing-1', name: 'Ca chua', isPurchased: false }
      ]
    };

    mockValidateObjectId.mockReturnValue(true);
    mockFindOne.mockResolvedValue(mockGrocery as any);

    const result = await GroceryService.viewGroceryDetail(userId, groceryId);

    expect(mockFindOne).toHaveBeenCalledWith({
      _id: groceryId,
      'user._id': userId
    });
    expect(result).toEqual(mockGrocery);
  });
});
