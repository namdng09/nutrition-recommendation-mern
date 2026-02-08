import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

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
    // Clean up database before each test
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});

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

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
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

  // Branch: auth not found
  it('should throw 401 error when email does not exist', async () => {
    await expect(
      AuthService.login({
        email: 'nonexistent@gmail.com',
        password: '123456'
      })
    ).rejects.toThrow('Invalid credentials');
  });

  // Branch: invalid password
  it('should throw 401 error when password is incorrect', async () => {
    await expect(
      AuthService.login({
        email: 'haidangphan2015@gmail.com',
        password: 'wrongpassword'
      })
    ).rejects.toThrow('Invalid credentials');
  });

  // Branch: user not found
  it('should throw 404 error when user is deleted', async () => {
    // Delete the user but keep auth
    await UserModel.findByIdAndDelete(userId);

    await expect(
      AuthService.login({
        email: 'haidangphan2015@gmail.com',
        password: '123456'
      })
    ).rejects.toThrow('User not found or inactive');
  });
});
