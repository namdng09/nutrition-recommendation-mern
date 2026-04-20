import generatePassword from 'generate-password';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createUserRequestSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import { hashPassword, sendMail } from '~/shared/utils';

vi.mock('generate-password', () => ({
  default: {
    generate: vi.fn()
  }
}));

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    paginate: vi.fn(),
    findById: vi.fn(),
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
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    buildPaginateOptions: vi.fn(),
    validateObjectId: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});
const mockFindOne = vi.mocked(UserModel.findOne);

const mockCreateUser = vi.mocked(UserModel.create);
const mockCreateAuth = vi.mocked(AuthModel.create);
const mockGeneratePassword = vi.mocked(generatePassword.generate);
const mockHashPassword = vi.mocked(hashPassword);
const mockSendMail = vi.mocked(sendMail);

describe('UserService.createUser (UC60)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when email is invalid', () => {
      const result = createUserRequestSchema.safeParse({
        email: 'bad-email',
        name: 'Admin Created User',
        gender: 'MALE',
        role: ROLE.USER
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Địa chỉ email không hợp lệ'
      );
    });
  });

  describe('business logic', () => {
    it('should throw error when email already exists', async () => {
      mockFindOne.mockResolvedValue({ _id: 'existing-user' } as any);

      await expect(
        UserService.createUser({
          email: 'duplicate@test.com',
          name: 'Duplicate User',
          gender: 'MALE' as any,
          role: ROLE.USER
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Email đã được sử dụng'
      });
    });

    it('should create user, auth record and send onboarding email', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        _id: 'user-1',
        email: 'new-user@test.com',
        name: 'New User'
      } as any);
      mockGeneratePassword.mockReturnValue('Strong@123Pass');
      mockHashPassword.mockResolvedValue('hashed-pass');
      mockCreateAuth.mockResolvedValue({ _id: 'auth-1' } as any);
      mockSendMail.mockResolvedValue({} as any);

      const result = await UserService.createUser({
        email: 'new-user@test.com',
        name: 'New User',
        gender: 'MALE' as any,
        role: ROLE.USER
      });

      expect(mockCreateAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user-1',
          provider: 'local',
          providerId: 'new-user@test.com'
        })
      );
      expect(mockSendMail).toHaveBeenCalled();
      expect(result.email).toBe('new-user@test.com');
    });

    it('should return created user even when sendMail fails', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        _id: 'user-2',
        email: 'mail-fail@test.com',
        name: 'Mail Fail'
      } as any);
      mockGeneratePassword.mockReturnValue('Strong@123Pass');
      mockHashPassword.mockResolvedValue('hashed-pass');
      mockCreateAuth.mockResolvedValue({ _id: 'auth-2' } as any);
      mockSendMail.mockRejectedValue(new Error('smtp down'));

      const result = await UserService.createUser({
        email: 'mail-fail@test.com',
        name: 'Mail Fail',
        gender: 'MALE' as any,
        role: ROLE.USER
      });

      expect(result._id).toBe('user-2');
    });
  });
});
