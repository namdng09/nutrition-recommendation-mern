import createHttpError from 'http-errors';
import { HydratedDocument } from 'mongoose';

import { AuthModel, UserModel } from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
import {
  comparePassword,
  generateResetPasswordToken,
  generateToken,
  hashPassword,
  sendMail,
  uploadAvatar,
  verifyToken
} from '~/shared/utils';

import type {
  LoginRequest,
  LoginResponse,
  LoginWithProviderResponse,
  SignUpRequest,
  SignUpResponse
} from './auth-dto';

export const AuthService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const auth = await AuthModel.findOne({
      provider: 'local',
      providerId: data.email
    });

    if (!auth || !auth.localPassword) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(
      data.password,
      auth.localPassword
    );
    if (!isValidPassword) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const user = await UserModel.findById(auth.user);
    if (!user || !user.isActive) {
      throw createHttpError(404, 'User not found or inactive');
    }

    const { accessToken, refreshToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: user.hasOnboarded
    });

    return {
      accessToken,
      refreshToken,
      hasOnboarded: user.hasOnboarded
    };
  },

  loginWithProvider: async (
    provider: string,
    providerId: string,
    user: HydratedDocument<User>
  ): Promise<LoginWithProviderResponse> => {
    if (!user || !user._id) {
      throw createHttpError(400, 'User not found');
    }

    let auth = await AuthModel.findOne({ provider, providerId });

    if (!auth) {
      auth = await AuthModel.create({
        user: user._id,
        provider,
        providerId,
        verifyAt: new Date()
      });
    } else {
      auth.verifyAt = new Date();
      await auth.save();
    }

    const { accessToken, refreshToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: user.hasOnboarded
    });

    return {
      accessToken,
      refreshToken,
      hasOnboarded: user.hasOnboarded
    };
  },

  signUp: async (
    data: SignUpRequest,
    avatar?: Express.Multer.File
  ): Promise<SignUpResponse> => {
    const newUser = await createNewUser(data, avatar);

    const existingAuth = await AuthModel.findOne({
      provider: 'local',
      providerId: data.email
    });

    if (existingAuth) {
      throw createHttpError(
        400,
        'Unable to create account with provided information'
      );
    }

    const hashedPassword = await hashPassword(data.password);

    await AuthModel.create({
      user: newUser._id,
      provider: 'local',
      providerId: data.email,
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    const { accessToken, refreshToken } = generateToken({
      id: newUser._id.toString(),
      role: newUser.role,
      hasOnboarded: newUser.hasOnboarded
    });

    return {
      accessToken,
      refreshToken,
      hasOnboarded: newUser.hasOnboarded
    };
  },

  refreshAccessToken: async (refreshToken: string): Promise<string> => {
    if (!refreshToken) {
      throw createHttpError(401, 'Refresh token is required');
    }

    const decoded = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your_jwt_secret'
    );

    // If the decoded token is a string, it means the token is invalid
    if (typeof decoded === 'string') {
      throw createHttpError(400, 'Invalid refresh token');
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const { accessToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: user.hasOnboarded
    });

    return accessToken;
  },

  forgotPassword: async (email: string): Promise<void> => {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const resetToken = generateResetPasswordToken(user._id.toString());

    sendMail({
      to: user.email,
      subject: 'Password Reset',
      template: 'password-reset',
      templateData: {
        name: user.name,
        resetUrl: `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`
      }
    }).catch(error => {
      console.error('Failed to send reset password email:', error);
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const storedLastResetToken = await AuthModel.findOne({
      lastResetPasswordToken: token
    });

    if (storedLastResetToken) {
      throw createHttpError(
        400,
        'This reset password token has already been used'
      );
    }

    const decoded = verifyToken(token, process.env.JWT_RESET_PASSWORD_SECRET!);

    // If the decoded token is a string, it means the token is invalid
    if (typeof decoded === 'string') {
      throw createHttpError(400, 'Invalid reset password token');
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await hashPassword(newPassword);
    let auth = await AuthModel.findOne({ user: user._id, provider: 'local' });

    if (!auth) {
      auth = await AuthModel.create({
        user: user._id,
        provider: 'local',
        providerId: user.email,
        localPassword: hashedPassword,
        verifyAt: new Date(),
        lastResetPasswordToken: token
      });
      return;
    }

    auth.localPassword = hashedPassword;
    auth.lastResetPasswordToken = token;
    await auth.save();
  }
};

const createNewUser = async (
  data: SignUpRequest,
  avatar?: Express.Multer.File
) => {
  const existingUser = await UserModel.findOne({ email: data.email });

  if (existingUser) {
    throw createHttpError(
      400,
      'Unable to create account with provided information'
    );
  }

  const newUser = await UserModel.create({
    ...data,
    isActive: true
  });

  if (!newUser) {
    throw createHttpError(500, 'Unable to complete registration at this time');
  }

  if (avatar) {
    const uploadResult = await uploadAvatar(
      avatar.buffer,
      newUser._id.toString()
    );
    if (uploadResult.success && uploadResult.data) {
      await UserModel.findByIdAndUpdate(newUser._id, {
        avatar: uploadResult.data.secure_url
      });
    } else {
      throw createHttpError(500, 'Failed to upload avatar');
    }
  }
  return newUser;
};
