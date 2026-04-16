import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateScheduleSettingsSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { AVAILABLE_TIME } from '~/shared/constants/available-time';
import { COOKING_PREFERENCE } from '~/shared/constants/cooking-preference';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { MEAL_COMPLEXITY } from '~/shared/constants/meal-complexity';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
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

describe('UserService.updateProfile (UC72 - Update Schedule Settings)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when mealSettings is invalid', async () => {
    const result = updateScheduleSettingsSchema.safeParse({
      mealSettings: []
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Phải có ít nhất một cài đặt bữa ăn'
    );
  });

  it('should fail when mealSettings has invalid meal type', async () => {
    const result = updateScheduleSettingsSchema.safeParse({
      mealSettings: [
        {
          name: 'Invalid Meal Type',
          dishCategories: [DISH_CATEGORY.BREAKFAST],
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.SOME_TIME,
          complexity: MEAL_COMPLEXITY.SIMPLE
        }
      ]
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Loại bữa ăn không hợp lệ');
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('bad-id', { mealSettings: [] })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u404', { mealSettings: [] })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update meal schedule settings', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({ _id: 'u1' });

    const mealSettings = [
      {
        name: MEAL_TYPE.BREAKFAST,
        dishCategories: [DISH_CATEGORY.BREAKFAST],
        cookingPreference: COOKING_PREFERENCE.CAN_COOK,
        mealSize: MEAL_SIZE.NORMAL,
        availableTime: AVAILABLE_TIME.SOME_TIME,
        complexity: MEAL_COMPLEXITY.SIMPLE
      }
    ];

    await UserService.updateProfile('u1', { mealSettings });

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { mealSettings },
      { new: true }
    );
  });
});
