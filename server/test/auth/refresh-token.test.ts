import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';
import { generateToken } from '~/shared/utils';

describe('AuthService.refreshAccessToken', () => {
  let userId: string;
  let validRefreshToken: string;

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
    await UserModel.deleteMany({});

    // Create a test user
    const user = await UserModel.create({
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();

    // Generate valid tokens
    const tokens = generateToken({
      id: userId,
      role: ROLE.USER
    });
    validRefreshToken = tokens.refreshToken;
  });

  afterAll(async () => {
    // Clean up and close connection
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case
  it('should refresh access token successfully with valid refresh token', async () => {
    const newAccessToken =
      await AuthService.refreshAccessToken(validRefreshToken);

    expect(typeof newAccessToken).toBe('string');
    expect(newAccessToken).not.toBe(validRefreshToken);
  });

  // Branch: no refresh token provided
  it('should throw 401 error when refresh token is missing', async () => {
    await expect(AuthService.refreshAccessToken('')).rejects.toThrow(
      'Refresh token is required'
    );
  });

  // Branch: invalid refresh token (malformed)
  it('should throw error when refresh token is invalid', async () => {
    await expect(
      AuthService.refreshAccessToken('invalid-token')
    ).rejects.toThrow();
  });

  // Branch: refresh token with wrong secret
  it('should throw 400 error when refresh token is signed with wrong secret', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const invalidToken = jwt.sign(
      'just-a-string',
      process.env.JWT_REFRESH_SECRET || 'your_jwt_secret'
    );

    await expect(AuthService.refreshAccessToken(invalidToken)).rejects.toThrow(
      'Invalid refresh token'
    );
  });

  // Branch: expired refresh token
  it('should throw error when refresh token is expired', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: userId, role: ROLE.USER },
      process.env.JWT_REFRESH_SECRET || 'your_jwt_secret',
      { expiresIn: '0s' } // Expired immediately
    );

    // Wait a bit to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 100));

    await expect(
      AuthService.refreshAccessToken(expiredToken)
    ).rejects.toThrow();
  });

  // Branch: user not found
  it('should throw 404 error when user does not exist', async () => {
    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    await expect(
      AuthService.refreshAccessToken(validRefreshToken)
    ).rejects.toThrow('User not found');
  });

  // Branch: refresh token with fallback secret
  it('should work with fallback secret when JWT_REFRESH_SECRET is not set', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const originalSecret = process.env.JWT_REFRESH_SECRET;

    // Temporarily unset JWT_REFRESH_SECRET
    delete process.env.JWT_REFRESH_SECRET;

    // Generate token with fallback secret
    const fallbackToken = jwt.sign(
      { id: userId, role: ROLE.USER },
      'your_jwt_secret',
      { expiresIn: '7d' }
    );

    const newAccessToken = await AuthService.refreshAccessToken(fallbackToken);

    // Restore original secret
    if (originalSecret) {
      process.env.JWT_REFRESH_SECRET = originalSecret;
    }

    expect(typeof newAccessToken).toBe('string');
  });
});
