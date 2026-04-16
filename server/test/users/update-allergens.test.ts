import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateAllergensSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { ALLERGEN } from '~/shared/constants/allergen';
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

describe('UserService.updateProfile (UC71 - Update Allergens)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when allergens is invalid', async () => {
    const result = updateAllergensSchema.safeParse({
      allergens: ['invalid-allergen']
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Dị ứng không hợp lệ');
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('bad-id', { allergens: [ALLERGEN.MILK] })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u404', { allergens: [ALLERGEN.MILK] })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update allergens list', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    await UserService.updateProfile('u1', {
      allergens: [ALLERGEN.MILK, ALLERGEN.PEANUTS]
    } as any);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { allergens: [ALLERGEN.MILK, ALLERGEN.PEANUTS] },
      { new: true }
    );
  });
});
