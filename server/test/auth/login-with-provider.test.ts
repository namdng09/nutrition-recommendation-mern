import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';

describe('AuthService.loginWithProvider', () => {
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
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Branch: user is null or undefined
  it('should throw 400 error when user is not provided', async () => {
    await expect(
      AuthService.loginWithProvider('google', 'google-user-123', null as any)
    ).rejects.toThrow('User not found');
  });

  // Branch: auth does not exist - create new auth
  it('should create new auth record when auth does not exist', async () => {
    const user = await UserModel.findById(userId);

    const result = await AuthService.loginWithProvider(
      'google',
      'google-user-123',
      user!
    );

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('hasOnboarded', false);

    // Verify auth was created
    const auth = await AuthModel.findOne({
      provider: 'google',
      providerId: 'google-user-123'
    });
    expect(auth).toBeDefined();
    expect(auth?.user.toString()).toBe(userId);
  });

  // Branch: auth exists - update verifyAt
  it('should update existing auth record when auth exists', async () => {
    // Create existing auth
    const existingAuth = await AuthModel.create({
      user: userId,
      provider: 'google',
      providerId: 'google-user-123',
      verifyAt: new Date('2020-01-01')
    });

    const oldVerifyAt = existingAuth.verifyAt;

    const user = await UserModel.findById(userId);

    const result = await AuthService.loginWithProvider(
      'google',
      'google-user-123',
      user!
    );

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('hasOnboarded', false);

    // Verify auth was updated
    const updatedAuth = await AuthModel.findById(existingAuth._id);
    expect(updatedAuth?.verifyAt).not.toEqual(oldVerifyAt);
    expect(updatedAuth?.verifyAt.getTime()).toBeGreaterThan(
      oldVerifyAt.getTime()
    );
  });
});
