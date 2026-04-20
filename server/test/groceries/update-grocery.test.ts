import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateGroceryRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    findOneAndUpdate: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn()
  };
});

const mockFindOneAndUpdate = vi.mocked(GroceryModel.findOneAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);

const userId = 'user123';
const groceryId = '507f1f77bcf86cd799439011';

describe('GroceryService.updateGrocery (UC31)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is too short', () => {
      const result = updateGroceryRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when grocery id is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.updateGrocery(userId, 'invalid-id', { name: 'Hop le' })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOneAndUpdate.mockResolvedValue(null);

      await expect(
        GroceryService.updateGrocery(userId, groceryId, { name: 'Hop le' })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should update grocery successfully', async () => {
      const updateData = {
        name: 'Danh sach moi',
        notes: 'ghi chu moi'
      };
      const mockGrocery = {
        _id: groceryId,
        ...updateData,
        user: { _id: userId, name: 'User' },
        ingredients: []
      };

      mockValidateObjectId.mockReturnValue(true);
      mockFindOneAndUpdate.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.updateGrocery(
        userId,
        groceryId,
        updateData
      );

      expect(result.name).toEqual('Danh sach moi');
      expect(result.notes).toEqual('ghi chu moi');
    });
  });
});
