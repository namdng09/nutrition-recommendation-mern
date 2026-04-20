import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { TOKEN_TYPE } from '~/shared/constants/token-type';
import { UserModel } from '~/shared/database/models';
import { generateToken, verifyToken } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn()
  },
  AuthModel: {}
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    verifyToken: vi.fn(),
    generateToken: vi.fn()
  };
});

const mockFindUser = vi.mocked(UserModel.findById);
const mockVerifyToken = vi.mocked(verifyToken);
const mockGenerateToken = vi.mocked(generateToken);

describe('AuthService.refreshAccessToken', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 401 when refresh token is missing', async () => {
    await expect(AuthService.refreshAccessToken('')).rejects.toMatchObject({
      status: 401,
      message: 'Token không được cung cấp'
    });
  });

  it('should propagate invalid refresh token error', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw Object.assign(new Error('Invalid token'), {
        status: 401,
        message: 'Invalid token'
      });
    });

    await expect(
      AuthService.refreshAccessToken('bad-token')
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid token'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockVerifyToken.mockReturnValue({ id: 'user-1' } as any);
    mockFindUser.mockResolvedValue(null);

    await expect(
      AuthService.refreshAccessToken('refresh-token')
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should return new access token when refresh token is valid', async () => {
    mockVerifyToken.mockReturnValue({
      id: 'user-1'
    } as any);
    mockFindUser.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      role: ROLE.USER,
      hasOnboarded: true
    } as any);
    mockGenerateToken.mockReturnValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    });

    const result = await AuthService.refreshAccessToken('valid-refresh-token');

    expect(mockVerifyToken).toHaveBeenCalledWith(
      'valid-refresh-token',
      process.env.JWT_REFRESH_SECRET,
      TOKEN_TYPE.REFRESH
    );
    expect(result).toBe('new-access-token');
  });
});
