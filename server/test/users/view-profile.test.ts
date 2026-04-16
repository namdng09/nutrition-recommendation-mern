import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import {
  getDailyTokenLimit,
  getNextQuotaResetAt,
  resolveMembershipLevel
} from '~/shared/config/ai-quota';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { UserModel } from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/config/ai-quota', () => ({
  getDailyTokenLimit: vi.fn(),
  getNextQuotaResetAt: vi.fn(),
  resolveMembershipLevel: vi.fn()
}));

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
const mockResolveMembershipLevel = vi.mocked(resolveMembershipLevel);
const mockGetDailyTokenLimit = vi.mocked(getDailyTokenLimit);
const mockGetNextQuotaResetAt = vi.mocked(getNextQuotaResetAt);

describe('UserService.viewProfile (UC65)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(UserService.viewProfile('bad-id')).rejects.toMatchObject({
      status: 400
    });
  });

  it('should throw 404 when user not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(null)
    } as any);

    await expect(
      UserService.viewProfile('507f1f77bcf86cd799439011')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should return profile and refresh ai quota when reset time passed', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockValidateObjectId.mockReturnValue(true);
    mockResolveMembershipLevel.mockReturnValue(MEMBERSHIP_LEVEL.NORMAL as any);
    mockGetDailyTokenLimit.mockReturnValue(100);
    mockGetNextQuotaResetAt.mockReturnValue(
      new Date('2026-04-17T00:00:00.000Z')
    );

    const userDoc = {
      _id: 'u1',
      membershipLevel: MEMBERSHIP_LEVEL.NORMAL,
      aiTokens: 0,
      aiDailyTokenLimit: 0,
      aiQuotaResetAt: new Date('2026-04-10T00:00:00.000Z'),
      save
    };

    mockFindById.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(userDoc)
    } as any);

    const result = await UserService.viewProfile('507f1f77bcf86cd799439011');

    expect(save).toHaveBeenCalled();
    expect(result._id).toBe('u1');
  });
});
