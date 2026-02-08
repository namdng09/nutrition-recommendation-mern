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

});
