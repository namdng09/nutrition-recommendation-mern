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

describe('UserService.removeBlockDish (UC80)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should remove dish from user block list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    const result = await UserService.removeBlockDish('u1', 'dish-9');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { $pull: { blockDishes: 'dish-9' } },
      { new: true }
    );
    expect(result._id).toBe('u1');
  });

  it('should throw 400 when dish is not in block list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    await expect(
      UserService.removeBlockDish('u1', 'missing-dish')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Món ăn không có trong danh sách chặn'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.removeBlockDish('missing', 'dish-9')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });
});
