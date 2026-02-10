import mongoose from 'mongoose';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import * as authUtils from '~/shared/utils';

vi.mock('~/shared/utils', async () => {
  const actual = await vi.importActual('~/shared/utils');
  return {
    ...actual,
    uploadAvatar: vi.fn()
  };
});

describe('AuthService.signUp', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }

    // Mock uploadAvatar to return success
    vi.mocked(authUtils.uploadAvatar).mockResolvedValue({
      success: true,
      data: {
        secure_url: 'https://example.com/avatar/test.jpg'
      }
    } as any);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case - sign up
  it('should sign up successfully with valid credentials', async () => {
    const mockFile = new File([Buffer.from('fake image data')], 'avatar.jpg', {
      type: 'image/jpeg'
    }) as any as Express.Multer.File;

    const result = await AuthService.signUp(
      {
        email: 'newuser@gmail.com',
        name: 'New User',
        password: '123456'
      },
      mockFile
    );

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('hasOnboarded', false);
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');

    // Verify user was created
    const user = await UserModel.findOne({ email: 'newuser@gmail.com' });
    expect(user).toBeDefined();
    expect(user?.name).toBe('New User');
    expect(user?.isActive).toBe(true);
    expect(user?.role).toBe(ROLE.USER);
    expect(user?.avatar).toBe('https://example.com/avatar/test.jpg');

    // Verify auth was created
    const auth = await AuthModel.findOne({ user: user?._id });
    expect(auth).toBeDefined();
    expect(auth?.provider).toBe('local');
    expect(auth?.providerId).toBe('newuser@gmail.com');
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.verifyAt).toBeDefined();
  });

  // Branch: invalid email format
  it('should throw 400 error when email is invalid', async () => {
    await expect(
      AuthService.signUp({
        email: 'invalid-email',
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Email không hợp lệ');
  });

  // Branch: missing email field
  it('should throw 400 error when field email is missing', async () => {
    await expect(
      AuthService.signUp({
        email: undefined as unknown as string,
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Email không hợp lệ');
  });

  // Branch: password is shorter than 6 characters
  it('should throw 400 error when password is too short', async () => {
    await expect(
      AuthService.signUp({
        email: 'newuser@gmail.com',
        name: 'New User',
        password: '123'
      })
    ).rejects.toThrow('Mật khẩu phải có ít nhất 6 ký tự');
  });

  // Branch: duplicate email (User exists)
  it('should throw 400 error when email already exists (User exists)', async () => {
    // Create existing user
    await UserModel.create({
      email: 'existing@gmail.com',
      name: 'Existing User',
      role: ROLE.USER,
      isActive: true
    });

    // Even if Auth doesn't exist, User existence should trigger error
    await expect(
      AuthService.signUp({
        email: 'existing@gmail.com',
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Tài khoản với email này đã tồn tại');
  });

  // Branch: Dangling Auth record (User doesn't exist, but Auth does)
  it('should throw 400 error when Auth record already exists (Dangling Auth)', async () => {
    // Manually create an Auth record without a corresponding User
    // This simulates a corrupted state or a previous failed cleanup
    const fakeUserId = new mongoose.Types.ObjectId();
    await AuthModel.create({
      user: fakeUserId,
      provider: 'local',
      providerId: 'dangling@gmail.com',
      localPassword: 'hashedpassword',
      verifyAt: new Date()
    });

    const mockFile = new File([Buffer.from('data')], 'avatar.jpg', {
      type: 'image/jpeg'
    }) as any as Express.Multer.File;

    await expect(
      AuthService.signUp(
        {
          email: 'dangling@gmail.com',
          name: 'New User',
          password: '123456'
        },
        mockFile
      )
    ).rejects.toThrow('Tài khoản với email này đã tồn tại');
  });

  // Branch: Avatar upload fails
  it('should throw 500 error when avatar upload fails', async () => {
    // Override mock for this test only
    vi.mocked(authUtils.uploadAvatar).mockResolvedValueOnce({
      success: false,
      error: 'Upload failed'
    } as any);

    const mockFile = new File([Buffer.from('data')], 'avatar.jpg', {
      type: 'image/jpeg'
    }) as any as Express.Multer.File;

    await expect(
      AuthService.signUp(
        {
          email: 'uploadfail@gmail.com',
          name: 'New User',
          password: '123456'
        },
        mockFile
      )
    ).rejects.toThrow('Không thể tải lên ảnh đại diện');
  });
});
