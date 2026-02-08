import mongoose from 'mongoose';
import request from 'supertest';
import {
  afterAll,
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
import * as uploadUtils from '~/shared/utils/cloudinary';

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

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case - sign up without avatar
  it('should sign up successfully without avatar', async () => {
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

  // Happy case - sign up with avatar
  it('should sign up successfully with avatar', async () => {
    // Mock successful avatar upload
    (uploadUtils.uploadAvatar as any).mockResolvedValue({
      success: true,
      data: {
        secure_url: 'https://cloudinary.com/avatar.jpg'
      }
    });

    const res = await request(app)
      .post('/api/auth/sign-up')
      .field('email', 'newuser@gmail.com')
      .field('name', 'New User')
      .field('password', '123456')
      .attach('avatar', Buffer.from('fake image'), 'avatar.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Sign up successful');

    // Verify user was created with avatar
    const user = await UserModel.findOne({ email: 'newuser@gmail.com' });
    expect(user).toBeDefined();
    expect(user?.avatar).toBe('https://cloudinary.com/avatar.jpg');

    // Verify uploadAvatar was called
    expect(uploadUtils.uploadAvatar).toHaveBeenCalledTimes(1);
  });

  // Branch: duplicate email
  it('should return 400 when email already exists', async () => {
    // Create existing user
    await UserModel.create({
      email: 'existing@gmail.com',
      name: 'Existing User',
      role: ROLE.USER,
      isActive: true
    });

    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'existing@gmail.com',
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Unable to create account with provided information'
    );
  });

  // Branch: duplicate auth
  it('should return 400 when auth already exists for email', async () => {
    // Create user and auth
    const user = await UserModel.create({
      email: 'existing@gmail.com',
      name: 'Existing User',
      role: ROLE.USER,
      isActive: true
    });

    await AuthModel.create({
      user: user._id,
      provider: 'local',
      providerId: 'existing@gmail.com',
      localPassword: 'hashedpassword',
      verifyAt: new Date()
    });

    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'existing@gmail.com',
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'Unable to create account with provided information'
    );
  });

  // Branch: avatar upload fails
  it('should return 500 when avatar upload fails', async () => {
    // Mock failed avatar upload
    (uploadUtils.uploadAvatar as any).mockResolvedValue({
      success: false,
      error: 'Upload failed'
    });

    const res = await request(app)
      .post('/api/auth/sign-up')
      .field('email', 'newuser@gmail.com')
      .field('name', 'New User')
      .field('password', '123456')
      .attach('avatar', Buffer.from('fake image'), 'avatar.jpg');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'Failed to upload avatar');
  });

  // Validation errors
  it('should return 400 when email is invalid', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'invalid-email',
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      name: 'New User',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when name is too short', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      name: 'A',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      password: '123456'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      name: 'New User',
      password: '123'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({
      email: 'newuser@gmail.com',
      name: 'New User'
    });

    expect(res.status).toBe(400);
  });
});
