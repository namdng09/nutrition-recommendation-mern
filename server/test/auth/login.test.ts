import { afterEach, describe, expect, it, vi } from 'vitest';

import { loginRequestSchema } from '~/features/auth/auth-dto';
import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import { comparePassword, generateToken } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  AuthModel: {
    findOne: vi.fn()
  },
  UserModel: {
    findById: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    comparePassword: vi.fn(),
    generateToken: vi.fn()
  };
});

const mockFindAuth = vi.mocked(AuthModel.findOne);
const mockFindUser = vi.mocked(UserModel.findById);
const mockComparePassword = vi.mocked(comparePassword);
const mockGenerateToken = vi.mocked(generateToken);

describe('AuthService.login (UC01)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when email format is invalid', () => {
      const result = loginRequestSchema.safeParse({
        email: 'invalid-email',
        password: '123456'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Email không hợp lệ');
    });

    it('should fail when password is too short', () => {
      const result = loginRequestSchema.safeParse({
        email: 'user@example.com',
        password: '123'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải có ít nhất 8 ký tự'
      );
    });

    it('should fail when password does not meet complexity requirements', () => {
      const result = loginRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 401 when local auth account does not exist', async () => {
      mockFindAuth.mockResolvedValue(null);

      await expect(
        AuthService.login({ email: 'user@example.com', password: '123456' })
      ).rejects.toMatchObject({
        status: 401,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    });

    it('should throw 401 when password is incorrect', async () => {
      mockFindAuth.mockResolvedValue({
        user: 'user-1',
        localPassword: 'hashed-pass'
      } as any);
      mockComparePassword.mockResolvedValue(false);

      await expect(
        AuthService.login({ email: 'user@example.com', password: 'wrong-pass' })
      ).rejects.toMatchObject({
        status: 401,
        message: 'Thông tin đăng nhập không hợp lệ'
      });
    });

    it('should throw 404 when user not found or inactive', async () => {
      mockFindAuth.mockResolvedValue({
        user: 'user-1',
        localPassword: 'hashed-pass'
      } as any);
      mockComparePassword.mockResolvedValue(true);
      mockFindUser.mockResolvedValue({ isActive: false } as any);

      await expect(
        AuthService.login({ email: 'user@example.com', password: '123456' })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa'
      });
    });

    it('should login successfully and return access/refresh tokens', async () => {
      const mockSave = vi.fn();
      const mockUser = {
        _id: { toString: () => 'user-1' },
        role: ROLE.USER,
        hasOnboarded: false,
        isActive: true,
        save: mockSave
      };

      mockFindAuth.mockResolvedValue({
        user: 'user-1',
        localPassword: 'hashed-pass'
      } as any);
      mockComparePassword.mockResolvedValue(true);
      mockFindUser.mockResolvedValue(mockUser as any);
      mockGenerateToken.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      const result = await AuthService.login({
        email: 'user@example.com',
        password: '123456'
      });

      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: 'user-1',
        role: ROLE.USER,
        hasOnboarded: false
      });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        hasOnboarded: false
      });
    });
  });
});
