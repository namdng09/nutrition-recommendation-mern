import { afterEach, describe, expect, it, vi } from 'vitest';

import { updatePhysicalStatsSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { GENDER } from '~/shared/constants/gender';
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

describe('UserService.updateProfile (UC68 - Update Physical Statistics)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when dob format is invalid', () => {
    const result = updatePhysicalStatsSchema.safeParse({
      gender: GENDER.MALE,
      dob: 'bad-date',
      height: 170,
      weight: 70,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Định dạng ngày sinh không hợp lệ'
    );
  });

  it('should fail when height is negative', () => {
    const result = updatePhysicalStatsSchema.safeParse({
      gender: GENDER.MALE,
      dob: '1990-01-01',
      height: -170,
      weight: 70,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Chiều cao phải là số dương');
  });

  it('should fail when weight is negative', () => {
    const result = updatePhysicalStatsSchema.safeParse({
      gender: GENDER.MALE,
      dob: '1990-01-01',
      height: 170,
      weight: -70,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Cân nặng phải là số dương');
  });

  it('should fail when userId is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('invalid-id', {} as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u1', {} as any)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update physical statistics successfully', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' } as any);

    await UserService.updateProfile('u1', {
      gender: GENDER.MALE,
      weight: 75,
      height: 175
    } as any);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        $set: expect.objectContaining({ gender: GENDER.MALE, height: 175 }),
        $push: expect.any(Object)
      }),
      { new: true }
    );
  });
});
