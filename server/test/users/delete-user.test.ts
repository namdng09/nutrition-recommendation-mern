import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import {
  AuthModel,
  GroceryModel,
  PostModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn()
  },
  AuthModel: {
    deleteMany: vi.fn(),
    create: vi.fn()
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

const mockDeleteUser = vi.mocked(UserModel.findByIdAndDelete);
const mockDeleteAuth = vi.mocked(AuthModel.deleteMany);
const mockDeleteGroceries = vi.mocked(GroceryModel.deleteMany);
const mockDeleteSchedules = vi.mocked(ScheduleModel.deleteMany);
const mockUpdatePosts = vi.mocked(PostModel.updateMany);

describe('UserService.deleteUser (UC64)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when admin tries to delete own account', async () => {
    await expect(
      UserService.deleteUser('admin-1', 'admin-1')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Admin không thể xóa tài khoản của chính mình'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockDeleteUser.mockResolvedValue(null);

    await expect(
      UserService.deleteUser('missing-user', 'admin-1')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should delete user and cleanup related data', async () => {
    mockDeleteUser.mockResolvedValue({ _id: 'user-2' } as any);
    mockDeleteAuth.mockResolvedValue({} as any);
    mockDeleteGroceries.mockResolvedValue({} as any);
    mockDeleteSchedules.mockResolvedValue({} as any);
    mockUpdatePosts.mockResolvedValue({} as any);

    const result = await UserService.deleteUser('user-2', 'admin-1');

    expect(result._id).toBe('user-2');
    expect(mockDeleteAuth).toHaveBeenCalled();
    expect(mockDeleteGroceries).toHaveBeenCalled();
    expect(mockDeleteSchedules).toHaveBeenCalled();
    expect(mockUpdatePosts).toHaveBeenCalledTimes(2);
  });
});
