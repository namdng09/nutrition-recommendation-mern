import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';

describe('POST /api/auth/login', () => {
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
    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(typeof res.body.data.accessToken).toBe('string');

    // Check refresh token in cookie
    expect(res.headers['set-cookie']).toBeDefined();
    const cookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie']];
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith('refreshToken=')
    );
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly');
  });

  // Branch: auth not found
  it('should return 401 when email does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  // Branch: no localPassword
  it('should return 401 when auth has no local password', async () => {
    // Create a user that registered via OAuth but trying to login locally
    const oauthUser = await UserModel.create({
      email: 'oauth@gmail.com',
      name: 'OAuth User',
      role: ROLE.USER,
      isActive: true
    });

    // Create local auth without password (edge case)
    await AuthModel.create({
      user: oauthUser._id,
      provider: 'local',
      providerId: 'oauth@gmail.com',
      verifyAt: new Date()
      // localPassword is intentionally omitted
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'oauth@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  // Branch: invalid password
  it('should return 401 when password is incorrect', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: 'wrongpassword'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  // Branch: user not found
  it('should return 404 when user is deleted', async () => {
    // Delete the user but keep auth
    await UserModel.findByIdAndDelete(userId);

    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found or inactive');
  });

  // Branch: user inactive
  it('should return 404 when user is inactive', async () => {
    // Set user as inactive
    await UserModel.findByIdAndUpdate(userId, { isActive: false });

    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found or inactive');
  });

  // Validation errors
  it('should return 400 when email is invalid', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'invalid-email',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '123'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com'
    });

    expect(res.status).toBe(400);
  });
});
