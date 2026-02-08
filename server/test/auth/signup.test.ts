import mongoose from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';

// Mock the upload utility
vi.mock('~/shared/utils/cloudinary', async () => {
  const actual = await vi.importActual('~/shared/utils/cloudinary');
  return {
    ...actual,
    uploadAvatar: vi.fn()
  };
});

describe('POST /api/auth/sign-up', () => {
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
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Happy case
  it('should sign up successfully', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Sign up successful');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(res.body.data).toHaveProperty('hasOnboarded', false);

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

    // Verify user was created
    const user = await UserModel.findOne({ email: 'newuser@gmail.com' });
    expect(user).toBeDefined();
    expect(user?.name).toBe('New User');
    expect(user?.isActive).toBe(true);
    expect(user?.role).toBe(ROLE.USER);

    // Verify auth was created
    const auth = await AuthModel.findOne({ user: user?._id });
    expect(auth).toBeDefined();
    expect(auth?.provider).toBe('local');
    expect(auth?.providerId).toBe('newuser@gmail.com');
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.verifyAt).toBeDefined();
  });

  // Wrong email format
  it('should return 400 when email format is invalid', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'invalid-email-format',
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });

  // Missing email field
  it('should return 400 when email field is missing', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });

  // Password less than 6 characters
  it('should return 400 when password is less than 6 characters', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      name: 'New User',
      password: '12345'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
  });
});
