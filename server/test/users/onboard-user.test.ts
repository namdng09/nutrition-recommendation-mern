import { afterEach, describe, expect, it, vi } from 'vitest';

import { onboardingRequestSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { DIET } from '~/shared/constants/diet';
import { GENDER } from '~/shared/constants/gender';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { USER_TARGET } from '~/shared/constants/user-target';
import { UserModel } from '~/shared/database/models';
import { generateToken, validateObjectId } from '~/shared/utils';

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

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    generateToken: vi.fn(),
    buildPaginateOptions: vi.fn(),
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockFindById = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockGenerateToken = vi.mocked(generateToken);

const validData = {
  gender: GENDER.MALE,
  dob: '2000-01-01',
  height: 170,
  weight: 70,
  bodyfat: BODYFAT.MEDIUM,
  diet: DIET.ANYTHING,
  activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT,
  mealSettings: [
    {
      name: MEAL_TYPE.BREAKFAST,
      dishCategories: ['MÃ³n nÆ°á»›c'],
      cookingPreference: 'CÃ³ thá»ƒ náº¥u Äƒn',
      mealSize: 'Vá»«a',
      availableTime: '20 phÃºt',
      complexity: 'ÄÆ¡n giáº£n'
    }
  ],
  goal: { target: USER_TARGET.MAINTAIN_WEIGHT }
};

describe('UserService.onboardUser (UC66)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when field format is invalid', () => {
      const result = onboardingRequestSchema.safeParse({
        ...validData,
        gender: 'INVALID' as any
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Giới tính không hợp lệ');
    });

    it('should fail when meal settings are empty', () => {
      const result = onboardingRequestSchema.safeParse({
        ...validData,
        mealSettings: []
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Phải có ít nhất một bữa ăn'
      );
    });

    it('should fail when height is negative', () => {
      const result = onboardingRequestSchema.safeParse({
        ...validData,
        height: -170
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Chiều cao phải là số dương'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when id format is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        UserService.onboardUser('invalid-id', validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should throw 400 when user already onboarded', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({ hasOnboarded: true } as any);

      await expect(
        UserService.onboardUser('507f1f77bcf86cd799439011', validData as any)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Người dùng đã hoàn thành onboarding'
      });
    });

    it('should complete onboarding successfully', async () => {
      const set = vi.fn();
      const save = vi.fn().mockResolvedValue(undefined);
      mockValidateObjectId.mockReturnValue(true);
      mockFindById.mockResolvedValue({
        _id: { toString: () => 'user-1' },
        role: ROLE.USER,
        hasOnboarded: false,
        set,
        save
      } as any);
      mockGenerateToken.mockReturnValue({
        accessToken: 'access-1',
        refreshToken: 'refresh-1'
      } as any);

      const result = await UserService.onboardUser(
        '507f1f77bcf86cd799439011',
        validData as any
      );

      expect(save).toHaveBeenCalled();
      expect(result.hasOnboarded).toBe(true);
      expect(result.accessToken).toBe('access-1');
    });
  });
});
