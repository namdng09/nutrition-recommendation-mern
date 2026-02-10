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
import * as sharedUtils from '~/shared/utils';

// Mock the sendMail function to strictly test AuthService logic only
vi.mock('~/shared/utils', async () => {
  const actual = await vi.importActual('~/shared/utils');
  return {
    ...actual,
    sendMail: vi.fn().mockResolvedValue(true)
  };
});

describe('AuthService.forgotPassword', () => {
  let userId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    vi.clearAllMocks();

    const user = await UserModel.create({
      email: 'test@example.com',
      name: 'Test User',
      role: ROLE.USER,
      isActive: true
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  it('should send email when user exists', async () => {
    await AuthService.forgotPassword('test@example.com');

    expect(sharedUtils.sendMail).toHaveBeenCalledTimes(1);
    expect(sharedUtils.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Đặt lại mật khẩu',
        template: 'password-reset'
      })
    );
  });

  it('should throw 404 when user does not exist', async () => {
    await expect(
      AuthService.forgotPassword('nonexistent@example.com')
    ).rejects.toThrow('Không tìm thấy người dùng');

    // CRITICAL: Ensure no email is sent for non-existent users
    expect(sharedUtils.sendMail).not.toHaveBeenCalled();
  });

  it('should not throw if sendMail fails (graceful degradation)', async () => {
    // Mock sendMail to fail
    vi.mocked(sharedUtils.sendMail).mockRejectedValueOnce(
      new Error('Mail error')
    );

    // Should not throw, just log error internally
    await expect(
      AuthService.forgotPassword('test@example.com')
    ).resolves.not.toThrow();

    expect(sharedUtils.sendMail).toHaveBeenCalledTimes(1);
  });
});
