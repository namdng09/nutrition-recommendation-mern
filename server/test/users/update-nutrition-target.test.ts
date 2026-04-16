import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateNutritionTargetSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { USER_TARGET } from '~/shared/constants/user-target';
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

describe('UserService.updateProfile (UC69 - Update Nutrition Target)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when goal target is invalid', () => {
    const result = updateNutritionTargetSchema.safeParse({
      goal: { target: 'INVALID_TARGET' }
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Mục tiêu không hợp lệ');
  });

  it('should fail when nutrition target is invalid', () => {
    const result = updateNutritionTargetSchema.safeParse({
      goal: { target: USER_TARGET.LOSE_FAT },
      nutritionTarget: { caloriesTarget: -100 }
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Giá trị tối thiểu cho calories phải là số dương'
    );
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('bad-id', {
        goal: { target: USER_TARGET.LOSE_FAT }
      })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u1', {
        goal: { target: USER_TARGET.LOSE_FAT }
      })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update nutrition target and goal settings', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' } as any);

    await UserService.updateProfile('u1', {
      goal: {
        target: USER_TARGET.BUILD_MUSCLE,
        targetWeightChange: 0.2
      },
      nutritionTarget: {
        caloriesTarget: 2500
      }
    } as any);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        goal: expect.objectContaining({ target: USER_TARGET.BUILD_MUSCLE }),
        nutritionTarget: expect.objectContaining({ caloriesTarget: 2500 })
      }),
      { new: true }
    );
  });
});
