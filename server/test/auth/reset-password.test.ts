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

  // Happy case - reset password successfully
  it('should reset password successfully with valid token', async () => {
    await AuthService.resetPassword(resetToken, { password: 'newpassword123' });

    // Verify password was updated in database
    const auth = await AuthModel.findOne({ user: userId });
    const compareResult = await comparePassword(
      'newpassword123',
      auth!.localPassword!
    );
    expect(auth).toBeDefined();
    expect(auth?.localPassword).toBeDefined();
    expect(compareResult).toBe(true);
    expect(auth?.lastResetPasswordToken).toBe(resetToken);
  });

  // Branch: invalid token
  it('should throw error when reset token is invalid', async () => {
    await expect(
      AuthService.resetPassword('invalid-token', { password: 'newpassword123' })
    ).rejects.toThrow('Token không hợp lệ');
  });

  // Branch: token already used
  it('should throw error when reset token has already been used', async () => {
    // Use the token once
    await AuthService.resetPassword(resetToken, { password: 'newpassword123' });

    // Try to use the same token again
    await expect(
      AuthService.resetPassword(resetToken, { password: 'anotherpassword' })
    ).rejects.toThrow('Token đã được sử dụng');
  });

  // Branch: expired token
  it('should throw error when reset token is expired', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: userId },
      process.env.JWT_RESET_PASSWORD_SECRET,
      { expiresIn: '0s' } // Expired immediately
    );

    await expect(
      AuthService.resetPassword(expiredToken, { password: 'newpassword123' })
    ).rejects.toThrow('Token đã hết hạn');
  });

  // Branch: missing required field
  it('should throw error when password is missing', async () => {
    await expect(
      AuthService.resetPassword(resetToken, {
        password: undefined as unknown as string
      })
    ).rejects.toThrow('Mật khẩu là bắt buộc');
  });

  // Branch: password too short
  it('should throw error when password is less than 6 characters', async () => {
    await expect(
      AuthService.resetPassword(resetToken, { password: '123' })
    ).rejects.toThrow('Mật khẩu phải có ít nhất 6 ký tự');
  });

  // Branch: user not found
  it('should throw error when user does not exist', async () => {
    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    await expect(
      AuthService.resetPassword(resetToken, { password: 'newpassword123' })
    ).rejects.toThrow('Không tìm thấy người dùng');
  });
});
