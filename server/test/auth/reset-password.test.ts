import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import { generateResetPasswordToken, hashPassword } from '~/shared/utils';

describe('POST /api/auth/reset-password', () => {
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
    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Your password has been reset successfully'
    );

    // Verify password was updated in database
    const auth = await AuthModel.findOne({ user: userId });
    expect(auth).toBeDefined();
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.localPassword).not.toBe('oldpassword'); // Should be hashed
    expect(auth?.lastResetPasswordToken).toBe(resetToken);

    // Verify user can login with new password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'testuser@gmail.com',
      password: 'newpassword123'
    });
    expect(loginRes.status).toBe(200);
  });

  // Happy case - create new auth if not exists
  it('should create new auth record if user has no local auth', async () => {
    // Delete existing auth
    await AuthModel.deleteMany({ user: userId });

    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty(
      'message',
      'Your password has been reset successfully'
    );

    // Verify new auth was created
    const auth = await AuthModel.findOne({ user: userId, provider: 'local' });
    expect(auth).toBeDefined();
    expect(auth?.localPassword).toBeDefined();
    expect(auth?.providerId).toBe('testuser@gmail.com');
    expect(auth?.lastResetPasswordToken).toBe(resetToken);
  });

  // Branch: token already used
  it('should return 400 when reset token has already been used', async () => {
    // Use the token once
    await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: 'newpassword123'
      });

    // Try to use the same token again
    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: 'anotherpassword'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty(
      'message',
      'This reset password token has already been used'
    );
  });

  // Branch: invalid token (malformed)
  it('should return 500 when reset token is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password?token=invalid-token')
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'jwt malformed');
  });

  // Branch: token signed with wrong secret
  it('should return 500 when reset token is signed with wrong secret', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const invalidToken = jwt.sign({ id: userId }, 'wrong-secret', {
      expiresIn: '1h'
    });

    const res = await request(app)
      .post(`/api/auth/reset-password?token=${invalidToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message', 'invalid signature');
  });

  // Branch: expired token
  it('should return 401 when reset token is expired', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: userId },
      process.env.JWT_RESET_PASSWORD_SECRET || 'your_reset_password_secret',
      { expiresIn: '0s' } // Expired immediately
    );

    // Wait a bit to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 100));

    const res = await request(app)
      .post(`/api/auth/reset-password?token=${expiredToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'Token expired');
  });

  // Branch: user not found
  it('should return 404 when user does not exist', async () => {
    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  // Branch: token for non-existent user
  it('should return 404 when reset token contains invalid user ID', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId().toString();
    const invalidToken = generateResetPasswordToken(nonExistentUserId);

    const res = await request(app)
      .post(`/api/auth/reset-password?token=${invalidToken}`)
      .send({
        password: 'newpassword123'
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  // Validation errors
  it('should return 400 when password is too short', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({
        password: '123'
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password?token=${resetToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 when token is missing', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      password: 'newpassword123'
    });

    expect(res.status).toBe(400);
  });
});
