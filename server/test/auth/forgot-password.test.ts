import { afterEach, describe, expect, it, vi } from 'vitest';

import { forgotPasswordRequestSchema } from '~/features/auth/auth-dto';
import { AuthService } from '~/features/auth/auth-service';
import { UserModel } from '~/shared/database/models';
import { generateResetPasswordToken, sendMail } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findOne: vi.fn()
  },
  AuthModel: {}
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    generateResetPasswordToken: vi.fn(),
    sendMail: vi.fn().mockResolvedValue(true)
  };
});

const mockFindUser = vi.mocked(UserModel.findOne);
const mockGenerateResetToken = vi.mocked(generateResetPasswordToken);
const mockSendMail = vi.mocked(sendMail);

describe('AuthService.forgotPassword (UC05 step 1-2)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when email format is invalid', () => {
      const result = forgotPasswordRequestSchema.safeParse({
        email: 'invalid-email'
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Email không hợp lệ');
    });
  });

  describe('business logic', () => {
    it('should throw 404 when user does not exist', async () => {
      mockFindUser.mockResolvedValue(null);

      await expect(
        AuthService.forgotPassword({ email: 'missing@example.com' })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy người dùng'
      });
    });

    it('should generate reset token and send reset email', async () => {
      mockFindUser.mockResolvedValue({
        _id: { toString: () => 'user-1' },
        email: 'user@example.com',
        name: 'User 1'
      } as any);
      mockGenerateResetToken.mockReturnValue('reset-token-123');

      await AuthService.forgotPassword({ email: 'user@example.com' });

      expect(mockGenerateResetToken).toHaveBeenCalledWith('user-1');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          template: 'password-reset',
          templateData: expect.objectContaining({
            resetUrl: expect.stringContaining('reset-token-123')
          })
        })
      );
    });
  });
});
