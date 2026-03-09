import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateGroceryRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import { GroceryModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { findOneAndUpdate: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockFindOneAndUpdate = vi.mocked(GroceryModel.findOneAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const GROCERY_ID = 'grocery123';
const validData = { name: 'Danh sách cập nhật' };

describe('GroceryService.updateGrocery', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when name is not a string', () => {
      const result = updateGroceryRequestSchema.safeParse({ name: 1234 });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm không hợp lệ'
      );
    });

    it('should fail when name is too short', () => {
      const result = updateGroceryRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(false);

      await expect(
        GroceryService.updateGrocery('invalid-id', GROCERY_ID, validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when groceryId is invalid', async () => {
      mockValidateObjectId.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await expect(
        GroceryService.updateGrocery(USER_ID, 'invalid-id', validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID danh sách mua sắm không hợp lệ'
      });
    });

    it('should throw 404 when grocery does not exist', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindOneAndUpdate.mockResolvedValue(null);

      await expect(
        GroceryService.updateGrocery(USER_ID, GROCERY_ID, validData)
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy danh sách mua sắm'
      });
    });

    it('should update grocery successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const updateData = {
        name: 'Danh sách mới',
        notes: 'Ghi chú mới',
        date: [new Date('2026-03-05')]
      };
      const mockGrocery = {
        _id: GROCERY_ID,
        ...updateData,
        user: { _id: USER_ID, name: 'User' },
        ingredients: []
      };
      mockFindOneAndUpdate.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.updateGrocery(
        USER_ID,
        GROCERY_ID,
        updateData
      );

      expect(result).toEqual(mockGrocery);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: GROCERY_ID, 'user._id': USER_ID },
        updateData,
        { new: true }
      );
    });
  });
});
