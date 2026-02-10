import mongoose from 'mongoose';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AuthService } from '~/features/auth/auth-service';
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

describe('AuthService.forgotPassword', () => {
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

    await AuthService.forgotPassword('testuser@gmail.com');

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
  it('should throw 404 error when user does not exist', async () => {
    await expect(
      AuthService.forgotPassword('nonexistent@gmail.com')
    ).rejects.toThrow('User not found');

    // Verify sendMail was not called
    expect(emailUtils.sendMail).not.toHaveBeenCalled();
  });

  // Branch: email sending fails (catch block)
  it('should not throw error when email sending fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Create a test user
    await UserModel.create({
      email: 'testuser@gmail.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });

    // Mock sendMail to reject
    (emailUtils.sendMail as any).mockRejectedValueOnce(
      new Error('Email service error')
    );

    // Should not throw error
    await expect(
      AuthService.forgotPassword('testuser@gmail.com')
    ).resolves.toBeUndefined();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to send reset password email:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
