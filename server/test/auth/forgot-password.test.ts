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
import { UserModel } from '~/shared/database/models';
import * as emailUtils from '~/shared/utils/email/mailer';

// Mock the email utility
vi.mock('~/shared/utils/email/mailer', async () => {
  const actual = await vi.importActual('~/shared/utils/email/mailer');
  return {
    ...actual,
    sendMail: vi.fn().mockResolvedValue(undefined)
  };
});

describe('POST /api/auth/forgot-password', () => {
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
    vi.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up and close connection
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Happy case
  it('should send password reset email successfully', async () => {
    // Create a test user
    const user = await UserModel.create({
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });

    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'testuser@gmail.com'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'A password reset link has been sent to your email'
    );

    // Verify sendMail was called with correct parameters
    expect(emailUtils.sendMail).toHaveBeenCalledTimes(1);
    expect(emailUtils.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'testuser@gmail.com',
        subject: 'Password Reset',
        template: 'password-reset',
        templateData: expect.objectContaining({
          name: 'Test User',
          resetUrl: expect.stringContaining('/auth/reset-password?token=')
        })
      })
    );
  });

  // Branch: user not found
  it('should return 404 when user does not exist', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'nonexistent@gmail.com'
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found');

    // Verify sendMail was not called
    expect(emailUtils.sendMail).not.toHaveBeenCalled();
  });

  // Branch: email sending fails (should still return success to prevent email enumeration)
  it('should return success even if email sending fails', async () => {
    // Mock email sending to reject
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (emailUtils.sendMail as any).mockRejectedValueOnce(
      new Error('Email service error')
    );

    // Create a test user
    await UserModel.create({
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });

    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'testuser@gmail.com'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'A password reset link has been sent to your email'
    );

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send reset password email:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  // Validation errors
  it('should return 400 when email is invalid', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'invalid-email'
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});

    expect(res.status).toBe(400);
  });
});
