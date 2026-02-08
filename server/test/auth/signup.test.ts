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
import * as uploadUtils from '~/shared/utils/cloudinary';

// Mock the upload utility
vi.mock('~/shared/utils/cloudinary', async () => {
  const actual = await vi.importActual('~/shared/utils/cloudinary');
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
  });

  beforeEach(async () => {
    // Clean up database before each test
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    vi.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case - sign up without avatar
  it('should sign up successfully without avatar', async () => {
    const result = await AuthService.signUp({
      email: 'newuser@gmail.com',
      name: 'New User',
      password: '123456'
    });

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

    // Verify auth was created
    const auth = await AuthModel.findOne({ user: user?._id });
    expect(auth).toBeDefined();
    expect(auth?.provider).toBe('local');
    expect(auth?.providerId).toBe('newuser@gmail.com');
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.verifyAt).toBeDefined();
  });

  // Happy case - sign up with avatar
  it('should sign up successfully with avatar', async () => {
    // Mock successful avatar upload
    (uploadUtils.uploadAvatar as any).mockResolvedValue({
      success: true,
      data: {
        secure_url: 'https://cloudinary.com/avatar.jpg'
      }
    });

    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('fake image'),
      fieldname: 'avatar',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '',
      filename: 'avatar.jpg',
      path: '',
      stream: null as any
    };

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

    // Verify user was created with avatar
    const user = await UserModel.findOne({ email: 'newuser@gmail.com' });
    expect(user).toBeDefined();
    expect(user?.avatar).toBe('https://cloudinary.com/avatar.jpg');

    // Verify uploadAvatar was called
    expect(uploadUtils.uploadAvatar).toHaveBeenCalledTimes(1);
  });

  // Branch: duplicate email
  it('should throw 400 error when email already exists', async () => {
    // Create existing user
    await UserModel.create({
      email: 'existing@gmail.com',
      name: 'Existing User',
      role: ROLE.USER,
      isActive: true
    });

    await expect(
      AuthService.signUp({
        email: 'existing@gmail.com',
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Unable to create account with provided information');
  });

  // Branch: duplicate auth (after user creation)
  it('should throw 400 error when auth already exists after creating user', async () => {
    // Create another user first
    const existingUser = await UserModel.create({
      email: 'other@gmail.com',
      name: 'Other User',
      role: ROLE.USER,
      isActive: true
    });

    // Create auth for a different email
    await AuthModel.create({
      user: existingUser._id,
      provider: 'local',
      providerId: 'newuser@gmail.com',
      localPassword: 'hashedpassword',
      verifyAt: new Date()
    });

    await expect(
      AuthService.signUp({
        email: 'newuser@gmail.com',
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Unable to create account with provided information');
  });

  // Branch: avatar upload fails
  it('should throw 500 error when avatar upload fails', async () => {
    // Mock failed avatar upload
    (uploadUtils.uploadAvatar as any).mockResolvedValue({
      success: false,
      error: 'Upload failed'
    });

    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('fake image'),
      fieldname: 'avatar',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '',
      filename: 'avatar.jpg',
      path: '',
      stream: null as any
    };

    await expect(
      AuthService.signUp(
        {
          email: 'newuser@gmail.com',
          name: 'New User',
          password: '123456'
        },
        mockFile
      )
    ).rejects.toThrow('Failed to upload avatar');
  });

  // Branch: user creation fails
  it('should throw 500 error when user creation fails', async () => {
    vi.spyOn(UserModel, 'create').mockResolvedValueOnce(null as any);

    await expect(
      AuthService.signUp({
        email: 'newuser@gmail.com',
        name: 'New User',
        password: '123456'
      })
    ).rejects.toThrow('Unable to complete registration at this time');

    vi.spyOn(UserModel, 'create').mockRestore();
  });
});
