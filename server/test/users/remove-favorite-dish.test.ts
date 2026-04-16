import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { UserModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
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

describe('UserService.removeFavoriteDish (UC74)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should remove dish from user favorite list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    const result = await UserService.removeFavoriteDish('u1', 'dish-1');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { $pull: { favoriteDishes: 'dish-1' } },
      { new: true }
    );
    expect(result._id).toBe('u1');
  });

  it('should throw 400 when remove dish not in favorite list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.removeFavoriteDish('u1', 'dish-1')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Món ăn không nằm trong danh sách yêu thích'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.removeFavoriteDish('missing', 'dish-1')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });
});
