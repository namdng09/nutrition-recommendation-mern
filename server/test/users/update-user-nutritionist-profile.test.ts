import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateNutritionistProfileSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { ROLE } from '~/shared/constants/role';
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
  AuthModel: { create: vi.fn(), deleteMany: vi.fn() },
  GroceryModel: { deleteMany: vi.fn() },
  ScheduleModel: { deleteMany: vi.fn() },
  PostModel: { updateMany: vi.fn() }
}));

const mockFindById = vi.mocked(UserModel.findById);

describe('UserService.updateUserNutritionistProfile (UC85 admin)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when field is too short', async () => {
    const result = updateNutritionistProfileSchema.safeParse({
      workplace: 'A',
      graduatedUniversity: 'Uni A'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Nơi làm việc phải có ít nhất 2 ký tự'
      );
    }
  });

  it('should throw 404 when user not found', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      UserService.updateUserNutritionistProfile('u1', {
        workplace: 'Clinic A',
        graduatedUniversity: 'Uni A'
      })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should throw 403 when target user is not nutritionist', async () => {
    mockFindById.mockResolvedValue({ role: ROLE.USER });

    await expect(
      UserService.updateUserNutritionistProfile('u1', {
        workplace: 'Clinic A',
        graduatedUniversity: 'Uni A'
      })
    ).rejects.toMatchObject({
      status: 403,
      message: 'Người dùng này không phải là chuyên gia dinh dưỡng'
    });
  });

  it('should update nutritionist profile successfully', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockFindById.mockResolvedValue({ role: ROLE.NUTRITIONIST, save });

    const result = await UserService.updateUserNutritionistProfile('u2', {
      workplace: 'Clinic B',
      graduatedUniversity: 'Uni B'
    });

    expect(save).toHaveBeenCalled();
    expect(result.role).toBe(ROLE.NUTRITIONIST);
  });
});
