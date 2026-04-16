import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { UserModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    paginate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
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

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn(),
    validateObjectId: vi.fn(),
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockPaginate = vi.mocked(UserModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('UserService.viewUsers (UC61)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return users list successfully', async () => {
    const parsed = { filter: { role: 'USER' }, limit: 10, page: 1 } as any;
    mockBuildPaginateOptions.mockReturnValue({ limit: 10, page: 1 } as any);
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'u1' }],
      totalDocs: 1
    } as any);

    const result = await UserService.viewUsers(parsed);

    expect(mockPaginate).toHaveBeenCalledWith(
      { role: 'USER' },
      { limit: 10, page: 1 }
    );
    expect(result.docs).toHaveLength(1);
  });

  it('should throw 404 when no users found', async () => {
    mockBuildPaginateOptions.mockReturnValue({ limit: 10, page: 1 } as any);
    mockPaginate.mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await expect(
      UserService.viewUsers({ filter: {} } as any)
    ).rejects.toMatchObject({
      status: 404
    });
  });
});
