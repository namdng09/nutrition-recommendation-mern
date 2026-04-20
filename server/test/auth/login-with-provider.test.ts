import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel } from '~/shared/database/models';
import { generateToken } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  AuthModel: {
    findOne: vi.fn(),
    create: vi.fn()
  },
  UserModel: {}
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    generateToken: vi.fn()
  };
});

const mockFindAuth = vi.mocked(AuthModel.findOne);
const mockCreateAuth = vi.mocked(AuthModel.create);
const mockGenerateToken = vi.mocked(generateToken);

describe('AuthService.loginWithProvider (UC02)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when user is missing', async () => {
    await expect(
      AuthService.loginWithProvider('google', 'google-1', null as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should create provider auth when auth does not exist', async () => {
    const mockSaveUser = vi.fn();
    const user = {
      _id: { toString: () => 'user-1' },
      role: ROLE.USER,
      hasOnboarded: false,
      save: mockSaveUser
    };

    mockFindAuth.mockResolvedValue(null);
    mockCreateAuth.mockResolvedValue({ _id: 'auth-1' } as any);
    mockGenerateToken.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });

    const result = await AuthService.loginWithProvider(
      'google',
      'google-1',
      user as any
    );

    expect(mockCreateAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        user: user._id,
        provider: 'google',
        providerId: 'google-1'
      })
    );
    expect(mockSaveUser).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      hasOnboarded: false
    });
  });

  it('should update verifyAt when provider auth already exists', async () => {
    const mockSaveAuth = vi.fn();
    const mockSaveUser = vi.fn();
    const existingAuth = {
      verifyAt: new Date('2020-01-01'),
      save: mockSaveAuth
    };
    const user = {
      _id: { toString: () => 'user-1' },
      role: ROLE.USER,
      hasOnboarded: true,
      save: mockSaveUser
    };

    mockFindAuth.mockResolvedValue(existingAuth as any);
    mockGenerateToken.mockReturnValue({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2'
    });

    const result = await AuthService.loginWithProvider(
      'google',
      'google-1',
      user as any
    );

    expect(mockSaveAuth).toHaveBeenCalled();
    expect(mockSaveUser).toHaveBeenCalled();
    expect(result.hasOnboarded).toBe(true);
  });
});
