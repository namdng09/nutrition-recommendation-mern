import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { UserModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
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

const mockFindById = vi.mocked(UserModel.findById);

describe('UserService.viewUserDetail (UC62)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return user detail when user exists', async () => {
    mockFindById.mockResolvedValue({ _id: 'u1', name: 'User 1' } as any);

    const result = await UserService.viewUserDetail('u1');

    expect(result._id).toBe('u1');
  });

  it('should throw 404 when user does not exist', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(UserService.viewUserDetail('missing')).rejects.toMatchObject({
      status: 404
    });
  });
});
