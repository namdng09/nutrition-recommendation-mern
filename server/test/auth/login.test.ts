import mongoose from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

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

  // Wrong email format
  it('should return 400 when email format is invalid', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'invalid-email-format',
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });

  // Missing email field
  it('should return 400 when email field is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });

  // Password less than 6 characters
  it('should return 400 when password is less than 6 characters', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '12345'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });

  // User inactive
  it('should return 404 when user is inactive or not found', async () => {
    // Set user to inactive
    await UserModel.findByIdAndUpdate(userId, { isActive: false });

    const res = await request(app).post('/api/auth/login').send({
      email: 'haidangphan2015@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found or inactive');
  });
});
