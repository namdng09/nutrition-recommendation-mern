import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';

describe('AuthService.login', () => {
  let userId: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Create a test user for happy case
    const user = await UserModel.create({
      email: 'haidangphan2015@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();

    // Create auth record with hashed password
    const hashedPassword = await hashPassword('123456');
    await AuthModel.create({
      user: user._id,
      provider: 'local',
      providerId: 'haidangphan2015@gmail.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await AuthModel.deleteMany({ providerId: 'haidangphan2015@gmail.com' });
    await UserModel.deleteMany({ email: 'haidangphan2015@gmail.com' });
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Happy case
  it('should login successfully with valid credentials', async () => {
    const result = await AuthService.login({
      email: 'haidangphan2015@gmail.com',
      password: '123456'
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('hasOnboarded');
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.hasOnboarded).toBe(false);
  });

  // Branch: invalid email format
  it('should return 401 error when email is invalid format', async () => {
    await expect(
      AuthService.login({
        email: 'invalid-email',
        password: '123456'
      })
    ).rejects.toThrow('Email không hợp lệ');
  });

  // Branch: missing required field
  it('should return 401 error when required field is missing', async () => {
    await expect(
      AuthService.login({
        email: undefined as unknown as string, // Missing email field
        password: '123456'
      })
    ).rejects.toThrow('Email không hợp lệ');
  });

  // Branch: invalid password
  it('should throw 401 error when credentials are invalid', async () => {
    await expect(
      AuthService.login({
        email: 'haidangphan2015@gmail.com',
        password: 'wrongpassword' // Incorrect password
      })
    ).rejects.toThrow('Thông tin đăng nhập không hợp lệ');
  });

  // Branch: User is inactive
  it('should throw 404 error when user is inactive', async () => {
    // Set user to inactive
    await UserModel.findByIdAndUpdate(userId, { isActive: false });

    await expect(
      AuthService.login({
        email: 'haidangphan2015@gmail.com',
        password: '123456'
      })
    ).rejects.toThrow(
      'Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa'
    );
  });

  // Branch: Email not found (Account does not exist)
  it('should throw 401 error when email does not exist', async () => {
    await expect(
      AuthService.login({
        email: 'nonexistent@gmail.com',
        password: '123456'
      })
    ).rejects.toThrow('Thông tin đăng nhập không hợp lệ');
  });

  // Branch: Orphaned Auth (Auth exists but User missing)
  it('should throw 404 error when Auth exists but User is missing', async () => {
    // Create an auth record linked to a non-existent user ID
    const fakeUserId = new mongoose.Types.ObjectId();
    const hashedPassword = await hashPassword('123456');
    await AuthModel.create({
      user: fakeUserId,
      provider: 'local',
      providerId: 'orphaned@gmail.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    await expect(
      AuthService.login({
        email: 'orphaned@gmail.com',
        password: '123456'
      })
    ).rejects.toThrow(
      'Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa'
    );
  });
});
