import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateRestrictionsSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { DIET } from '~/shared/constants/diet';
import { UserModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

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
  AuthModel: { create: vi.fn(), deleteMany: vi.fn() },
  GroceryModel: { deleteMany: vi.fn() },
  ScheduleModel: { deleteMany: vi.fn() },
  PostModel: { updateMany: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    buildPaginateOptions: vi.fn(),
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockFindByIdAndUpdate = vi.mocked(UserModel.findByIdAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);

describe('UserService.updateProfile (UC70 - Update Dietary Restrictions)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when diet is invalid', async () => {
    const result = updateRestrictionsSchema.safeParse({ diet: 'invalid-diet' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Chế độ ăn không hợp lệ');
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('bad-id', { diet: DIET.KETO })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u404', { diet: DIET.KETO })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update diet restriction field', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1', diet: DIET.KETO });

    const result = await UserService.updateProfile('u1', { diet: DIET.KETO });

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { diet: DIET.KETO },
      { new: true }
    );
    expect(result._id).toBe('u1');
  });
});
