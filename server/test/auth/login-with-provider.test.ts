import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import app from '~/app';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';

describe('GET /api/auth/google/callback', () => {
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
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    // Clean up and close connection
    await AuthModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  // Branch: user is null or undefined
  it('should return 400 when user is not provided', async () => {
    const mockReq: any = {
      user: null,
      authInfo: {
        provider: 'google',
        providerId: 'google-user-123'
      }
    };

    const mockRes: any = {
      cookie: () => mockRes,
      redirect: (url: string) => {
        mockRes.redirectUrl = url;
      },
      status: (code: number) => {
        mockRes.statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        mockRes.jsonData = data;
      },
      statusCode: 0,
      jsonData: null,
      redirectUrl: ''
    };

    const { AuthController } = await import('~/features/auth/auth-controller');
    
    try {
      await AuthController.loginWithProvider(mockReq, mockRes);
    } catch (error: any) {
      expect(error.status).toBe(400);
      expect(error.message).toBe('User not found');
    }
  });

  // Branch: auth does not exist - create new auth
  it('should create new auth record when auth does not exist', async () => {
    // Mock the OAuth callback to set user and authInfo
    const agent = request.agent(app);

    // Simulate successful OAuth by directly calling the controller with mocked request
    const mockReq: any = {
      user: await UserModel.findById(userId),
      authInfo: {
        provider: 'google',
        providerId: 'google-user-123'
      }
    };

    const mockRes: any = {
      cookie: () => mockRes,
      redirect: (url: string) => {
        mockRes.redirectUrl = url;
      },
      redirectUrl: ''
    };

    const { AuthController } = await import('~/features/auth/auth-controller');
    await AuthController.loginWithProvider(mockReq, mockRes);

    // Verify auth was created
    const auth = await AuthModel.findOne({
      provider: 'google',
      providerId: 'google-user-123'
    });
    expect(auth).toBeDefined();
    expect(auth?.user.toString()).toBe(userId);

    // Verify redirect URL contains tokens
    expect(mockRes.redirectUrl).toContain('accessToken=');
    expect(mockRes.redirectUrl).toContain('hasOnboarded=');
  });

  // Branch: auth exists - update verifyAt
  it('should update existing auth record when auth exists', async () => {
    // Create existing auth
    const existingAuth = await AuthModel.create({
      user: userId,
      provider: 'google',
      providerId: 'google-user-123',
      verifyAt: new Date('2020-01-01')
    });

    const oldVerifyAt = existingAuth.verifyAt;

    // Mock the OAuth callback
    const mockReq: any = {
      user: await UserModel.findById(userId),
      authInfo: {
        provider: 'google',
        providerId: 'google-user-123'
      }
    };

    const mockRes: any = {
      cookie: () => mockRes,
      redirect: (url: string) => {
        mockRes.redirectUrl = url;
      },
      redirectUrl: ''
    };

    const { AuthController } = await import('~/features/auth/auth-controller');
    await AuthController.loginWithProvider(mockReq, mockRes);

    // Verify auth was updated
    const updatedAuth = await AuthModel.findById(existingAuth._id);
    expect(updatedAuth?.verifyAt).not.toEqual(oldVerifyAt);
    expect(updatedAuth?.verifyAt.getTime()).toBeGreaterThan(
      oldVerifyAt.getTime()
    );

    // Verify redirect URL contains tokens
    expect(mockRes.redirectUrl).toContain('accessToken=');
    expect(mockRes.redirectUrl).toContain('hasOnboarded=');
  });
});
