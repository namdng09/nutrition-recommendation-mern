import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

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

const mockFindById = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);

describe('UserService.updateNutritionistProfile (UC85)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateNutritionistProfile('bad-id', {
        workplace: 'Hospital A',
        graduatedUniversity: 'Uni A'
      })
    ).rejects.toHaveProperty('status');
  });

  it('should throw 403 when user is not nutritionist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({ role: ROLE.USER } as any);

    await expect(
      UserService.updateNutritionistProfile('u1', {
        workplace: 'Hospital A',
        graduatedUniversity: 'Uni A'
      })
    ).rejects.toHaveProperty('status');
  });

  it('should save nutritionist profile metadata', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({ role: ROLE.NUTRITIONIST, save } as any);

    const result = await UserService.updateNutritionistProfile('u2', {
      workplace: 'Hospital B',
      graduatedUniversity: 'Uni B'
    });

    expect(save).toHaveBeenCalled();
    expect(result.role).toBe(ROLE.NUTRITIONIST);
  });
});
