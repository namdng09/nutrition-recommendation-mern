import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';
import { generateToken } from '~/shared/utils';

describe('POST /api/auth/refresh-access-token', () => {
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
    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .set('Cookie', [`refreshToken=${validRefreshToken}`])
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Access token refreshed successfully'
    );
    expect(res.body.data).toHaveProperty('accessToken');
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(res.body.data.accessToken).not.toBe(validRefreshToken);
  });

  // Branch: no refresh token provided
  it('should return 401 when refresh token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .send();

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Refresh token is required');
  });

  // Branch: invalid refresh token (malformed)
  it('should return 500 when refresh token is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .set('Cookie', ['refreshToken=invalid-token'])
      .send();

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'jwt malformed');
  });

  // Branch: decoded token is string (invalid format)
  it('should return 400 when decoded token is invalid format', async () => {
    const jwt = require('jsonwebtoken');
    const invalidToken = jwt.sign('just-a-string', process.env.JWT_REFRESH_SECRET || 'your_jwt_secret');

    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .set('Cookie', [`refreshToken=${invalidToken}`])
      .send();

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Invalid refresh token');
  });

  // Branch: user not found
  it('should return 404 when user does not exist', async () => {
    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .set('Cookie', [`refreshToken=${validRefreshToken}`])
      .send();

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  // Branch: JWT_REFRESH_SECRET fallback
  it('should work with fallback secret when JWT_REFRESH_SECRET is not set', async () => {
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

    const res = await request(app)
      .post('/api/auth/refresh-access-token')
      .set('Cookie', [`refreshToken=${fallbackToken}`])
      .send();

    // Restore original secret
    if (originalSecret) {
      process.env.JWT_REFRESH_SECRET = originalSecret;
    }

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('accessToken');
  });
});
