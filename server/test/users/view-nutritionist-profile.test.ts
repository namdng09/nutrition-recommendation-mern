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

describe('UserService.viewNutritionistProfile (UC84)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.viewNutritionistProfile('bad-id')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue(null)
    } as any);

    await expect(
      UserService.viewNutritionistProfile('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should throw 403 when selected user is not nutritionist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ role: ROLE.USER })
    } as any);

    await expect(
      UserService.viewNutritionistProfile('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({
      status: 403,
      message: 'Người dùng này không phải chuyên gia dinh dưỡng'
    });
  });

  it('should return nutritionist profile detail', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'n1',
        role: ROLE.NUTRITIONIST,
        certificate: { showCertificate: true }
      })
    } as any);

    const result = await UserService.viewNutritionistProfile(
      '507f1f77bcf86cd799439011'
    );

    expect(result).toMatchObject({ _id: 'n1' });
  });

  it('should hide certificate fileUrl and publicId when showCertificate is false', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'n2',
        role: ROLE.NUTRITIONIST,
        certificate: {
          showCertificate: false,
          fileUrl: 'https://cdn.example.com/cert.pdf',
          publicId: 'cert-public-id',
          status: 'approved'
        }
      })
    } as any);

    const result = await UserService.viewNutritionistProfile(
      '507f1f77bcf86cd799439011'
    );

    expect(result.certificate).not.toHaveProperty('fileUrl');
    expect(result.certificate).not.toHaveProperty('publicId');
    expect(result.certificate).toMatchObject({
      showCertificate: false,
      status: 'approved'
    });
  });

  it('should return profile as-is when nutritionist has no certificate', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'n3',
        role: ROLE.NUTRITIONIST,
        certificate: null,
        nutritionistProfile: { bio: 'Registered nutritionist' }
      })
    } as any);

    const result = await UserService.viewNutritionistProfile(
      '507f1f77bcf86cd799439011'
    );

    expect(result).toMatchObject({ _id: 'n3' });
    expect(result.certificate).toBeNull();
    expect(result.nutritionistProfile).toMatchObject({
      bio: 'Registered nutritionist'
    });
  });
});
