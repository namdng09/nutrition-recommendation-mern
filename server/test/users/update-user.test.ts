import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateUserRequestSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { UserModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findByIdAndUpdate: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn(),
    countDocuments: vi.fn()
  },
  AuthModel: {
    create: vi.fn(),
    deleteMany: vi.fn()
  },
  GroceryModel: {
    deleteMany: vi.fn()
  },
  ScheduleModel: {
    deleteMany: vi.fn()
  },
  PostModel: {
    updateMany: vi.fn()
  }
}));

const mockFindByIdAndUpdate = vi.mocked(UserModel.findByIdAndUpdate);

describe('UserService.updateUser (UC63)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when email format is invalid', () => {
      const result = updateUserRequestSchema.safeParse({ email: 'bad-email' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Địa chỉ email không hợp lệ'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when admin disables own account', async () => {
      await expect(
        UserService.updateUser(
          'admin-1',
          { isActive: 'false' } as any,
          'admin-1'
        )
      ).rejects.toMatchObject({
        status: 400,
        message: 'Admin không thể vô hiệu hóa tài khoản của chính mình'
      });
    });

    it('should throw 404 when user to update does not exist', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(
        UserService.updateUser('missing-user', { name: 'X' } as any, 'admin-1')
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy người dùng'
      });
    });

    it('should update user info successfully', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({
        _id: 'user-1',
        name: 'Updated Name'
      } as any);

      const result = await UserService.updateUser(
        'user-1',
        { name: 'Updated Name' } as any,
        'admin-1'
      );

      expect(result.name).toBe('Updated Name');
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'user-1',
        { name: 'Updated Name' },
        { new: true }
      );
    });
  });
});
