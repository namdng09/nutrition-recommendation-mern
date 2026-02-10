import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import {
  comparePassword,
  generateResetPasswordToken,
  hashPassword
} from '~/shared/utils';

describe('AuthService.resetPassword', () => {
  let userId: string;
  let resetToken: string;

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

    // Create a test user
    const user = await UserModel.create({
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();

    // Create auth record with initial password
    const hashedPassword = await hashPassword('oldpassword');
    await AuthModel.create({
      user: user._id,
      provider: 'local',
      providerId: 'testuser@gmail.com',
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    // Generate reset token
    resetToken = generateResetPasswordToken(userId);
  });

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case - reset password with existing auth
  it('should reset password successfully with valid token', async () => {
    await AuthService.resetPassword(resetToken, 'newpassword123');

    // Verify password was updated in database
    const auth = await AuthModel.findOne({ user: userId });
    expect(auth).toBeDefined();
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.localPassword).not.toBe('oldpassword'); // Should be hashed
    expect(auth?.lastResetPasswordToken).toBe(resetToken);

    // Verify user can login with new password
    const loginResult = await AuthService.login({
      email: 'testuser@gmail.com',
      password: 'newpassword123'
    });
    expect(loginResult).toHaveProperty('accessToken');
    expect(loginResult).toHaveProperty('refreshToken');
  });

  // Happy case - create new auth if not exists
  it('should create new auth record if user has no local auth', async () => {
    // Delete existing auth
    await AuthModel.deleteMany({ user: userId });

    await AuthService.resetPassword(resetToken, 'newpassword123');

    // Verify new auth was created
    const auth = await AuthModel.findOne({ user: userId, provider: 'local' });
    expect(auth).toBeDefined();
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.providerId).toBe('testuser@gmail.com');
    expect(auth?.lastResetPasswordToken).toBe(resetToken);
  });

  // Branch: token already used
  it('should throw 400 error when reset token has already been used', async () => {
    // Use the token once
    await AuthService.resetPassword(resetToken, 'newpassword123');

    // Try to use the same token again
    await expect(
      AuthService.resetPassword(resetToken, 'anotherpassword')
    ).rejects.toThrow('This reset password token has already been used');
  });

  // Branch: invalid token (malformed)
  it('should throw error when reset token is invalid', async () => {
    await expect(
      AuthService.resetPassword('invalid-token', 'newpassword123')
    ).rejects.toThrow();
  });

  // Branch: token signed with wrong secret
  it('should throw 400 error when reset token is signed with wrong secret', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const invalidToken = jwt.sign(
      'just-a-string',
      process.env.JWT_RESET_PASSWORD_SECRET!
    );

    await expect(
      AuthService.resetPassword(invalidToken, 'newpassword123')
    ).rejects.toThrow('Invalid reset password token');
  });

  // Branch: expired token
  it('should throw error when reset token is expired', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: userId },
      process.env.JWT_RESET_PASSWORD_SECRET || 'your_reset_password_secret',
      { expiresIn: '0s' } // Expired immediately
    );

    // Wait a bit to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 100));

    await expect(
      AuthService.resetPassword(expiredToken, 'newpassword123')
    ).rejects.toThrow();
  });

  // Branch: user not found
  it('should throw 404 error when user does not exist', async () => {
    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    await expect(
      AuthService.resetPassword(resetToken, 'newpassword123')
    ).rejects.toThrow('User not found');
  });
});
