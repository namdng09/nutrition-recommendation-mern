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

describe('UserService.addBlockIngredient (UC81)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add ingredient to user block list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    const result = await UserService.addBlockIngredient('u1', 'ingredient-9');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { $addToSet: { blockIngredients: 'ingredient-9' } },
      { new: true }
    );
    expect(result._id).toBe('u1');
  });

  it('should throw 400 when ingredient is already in block list', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    await expect(
      UserService.addBlockIngredient('u1', 'ingredient-9')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Thành phần đã có trong danh sách chặn'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.addBlockIngredient('missing', 'ingredient-9')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });
});
