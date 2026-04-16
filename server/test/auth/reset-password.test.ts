import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetPasswordRequestSchema } from '~/features/auth/auth-dto';
import { AuthService } from '~/features/auth/auth-service';
import { TOKEN_TYPE } from '~/shared/constants/token-type';
import { AuthModel, UserModel } from '~/shared/database/models';
import { hashPassword, verifyToken } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  AuthModel: {
    findOne: vi.fn(),
    create: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    verifyToken: vi.fn(),
    hashPassword: vi.fn()
  };
});

const mockFindAuth = vi.mocked(AuthModel.findOne);
const mockCreateAuth = vi.mocked(AuthModel.create);
const mockFindUser = vi.mocked(UserModel.findById);
const mockVerifyToken = vi.mocked(verifyToken);
const mockHashPassword = vi.mocked(hashPassword);

describe('AuthService.resetPassword (UC05 step 3-4)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when password too short', () => {
      const result = resetPasswordRequestSchema.safeParse({
        password: 'Ab1@'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải có ít nhất 8 ký tự'
      );
    });

    it('should fail when password does not meet complexity', () => {
      const result = resetPasswordRequestSchema.safeParse({
        password: 'password1234'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when token already used', async () => {
      mockFindAuth.mockResolvedValueOnce({ _id: 'auth-used' } as any);

      await expect(
        AuthService.resetPassword('reset-token', { password: 'Abcd@1234' })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Token đã được sử dụng'
      });
    });

    it('should throw 404 when user does not exist', async () => {
      mockFindAuth.mockResolvedValueOnce(null);
      mockVerifyToken.mockReturnValue({ id: 'user-1' } as any);
      mockFindUser.mockResolvedValue(null);

      await expect(
        AuthService.resetPassword('reset-token', { password: 'Abcd@1234' })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy người dùng'
      });
    });

    it('should create local auth if user has no local auth yet', async () => {
      mockFindAuth.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockVerifyToken.mockReturnValue({ id: 'user-1' } as any);
      mockFindUser.mockResolvedValue({
        _id: { toString: () => 'user-1' },
        email: 'user@example.com'
      } as any);
      mockHashPassword.mockResolvedValue('hashed-pass');

      await AuthService.resetPassword('reset-token', { password: 'Abcd@1234' });

      expect(mockCreateAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.anything(),
          provider: 'local',
          providerId: 'user@example.com',
          localPassword: 'hashed-pass',
          lastResetPasswordToken: 'reset-token'
        })
      );
    });

    it('should update existing local auth password successfully', async () => {
      const mockSave = vi.fn();
      const authDoc = {
        localPassword: 'old-hash',
        lastResetPasswordToken: undefined,
        save: mockSave
      };

      mockFindAuth
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(authDoc as any);
      mockVerifyToken.mockReturnValue({ id: 'user-1' } as any);
      mockFindUser.mockResolvedValue({
        _id: { toString: () => 'user-1' },
        email: 'user@example.com'
      } as any);
      mockHashPassword.mockResolvedValue('new-hash');

      await AuthService.resetPassword('reset-token', { password: 'Abcd@1234' });

      expect(authDoc.localPassword).toBe('new-hash');
      expect(authDoc.lastResetPasswordToken).toBe('reset-token');
      expect(mockSave).toHaveBeenCalled();
      expect(mockVerifyToken).toHaveBeenCalledWith(
        'reset-token',
        process.env.JWT_RESET_PASSWORD_SECRET,
        TOKEN_TYPE.RESET_PASSWORD
      );
    });
  });
});
