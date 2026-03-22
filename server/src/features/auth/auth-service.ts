import createHttpError from 'http-errors';
import { HydratedDocument } from 'mongoose';

import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { ROLE } from '~/shared/constants/role';
import { TOKEN_TYPE } from '~/shared/constants/token-type';
import { AuthModel, UserModel } from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
import { eventBus } from '~/shared/events/event-bus';
import { EVENTS } from '~/shared/events/event-types';
import {
  comparePassword,
  generateResetPasswordToken,
  generateToken,
  hashPassword,
  sendMail,
  uploadAvatar,
  uploadCertificate,
  verifyToken
} from '~/shared/utils';

import {
  type LoginRequest,
  loginRequestSchema,
  type LoginResponse,
  type LoginWithProviderResponse,
  type ResetPasswordRequest,
  resetPasswordRequestSchema,
  type SignUpRequest,
  signUpRequestSchema,
  type SignUpResponse
} from './auth-dto';

// Updates loginStreak on the user document in-place (does not save).
// Rules: same-day login → no change; consecutive day → streak++;
// gap > 1 day → reset to 1.
function updateLoginStreak(user: {
  loginStreak?: { count: number; lastLoginDate?: Date | null } | null;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const last = user.loginStreak?.lastLoginDate
    ? new Date(user.loginStreak.lastLoginDate)
    : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (!last || last < yesterday) {
    user.loginStreak = { count: 1, lastLoginDate: today };
  } else if (last.getTime() === yesterday.getTime()) {
    user.loginStreak = {
      count: (user.loginStreak?.count ?? 0) + 1,
      lastLoginDate: today
    };
  }
  // else last === today → already logged in today, no change
}

export const AuthService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const validation = loginRequestSchema.safeParse(data);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw createHttpError(400, firstError.message);
    }

    const auth = await AuthModel.findOne({
      provider: 'local',
      providerId: data.email
    });

    if (!auth || !auth.localPassword) {
      throw createHttpError(401, 'Thông tin đăng nhập không hợp lệ');
    }

    const isValidPassword = await comparePassword(
      data.password,
      auth.localPassword
    );
    if (!isValidPassword) {
      throw createHttpError(401, 'Thông tin đăng nhập không hợp lệ');
    }

    const user = await UserModel.findById(auth.user);
    if (!user || !user.isActive) {
      throw createHttpError(
        404,
        'Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa'
      );
    }

    updateLoginStreak(user);
    await user.save();

    const { accessToken, refreshToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: user.hasOnboarded
    });

    eventBus.emit(EVENTS.USER_LOGGED_IN, {
      userId: user._id.toString(),
      loginStreak: user.loginStreak?.count ?? 1
    });

    return {
      accessToken,
      refreshToken,
      hasOnboarded: user.hasOnboarded
    };
  },

  loginWithProvider: async (
    provider: string | undefined,
    providerId: string | undefined,
    user: HydratedDocument<User>
  ): Promise<LoginWithProviderResponse> => {
    if (!user || !user._id) {
      throw createHttpError(400, 'Không tìm thấy người dùng');
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

    updateLoginStreak(user);
    await user.save();

    const { accessToken, refreshToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: user.hasOnboarded
    });

    eventBus.emit(EVENTS.USER_LOGGED_IN, {
      userId: user._id.toString(),
      loginStreak: user.loginStreak?.count ?? 1
    });

    return {
      accessToken,
      refreshToken,
      hasOnboarded: user.hasOnboarded
    };
  },

  signUp: async (
    data: SignUpRequest,
    avatar?: Express.Multer.File,
    certificate?: Express.Multer.File
  ): Promise<SignUpResponse> => {
    const existingAuth = await AuthModel.findOne({
      provider: 'local',
      providerId: data.email
    });

    if (existingAuth) {
      throw createHttpError(400, 'Tài khoản với email này đã tồn tại');
    }

    const newUser = await createNewUser(data, avatar);
    const hashedPassword = await hashPassword(data.password);

    await AuthModel.create({
      user: newUser._id,
      provider: 'local',
      providerId: data.email,
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    // Upload certificate and set nutritionist profile for Nutritionist registrations
    if (data.role === ROLE.NUTRITIONIST) {
      const updates: any = {};

      // Upload certificate
      if (certificate) {
        const certUpload = await uploadCertificate(
          certificate.buffer,
          newUser._id.toString()
        );
        if (certUpload.success && certUpload.data) {
          const certName =
            (data as any).certificateName || certificate.originalname;
          updates.certificate = {
            name: certName,
            fileUrl: certUpload.data.secure_url,
            publicId: certUpload.data.public_id,
            status: CERTIFICATE_STATUS.PENDING
          };
        }
      }

      // Set nutritionist profile if provided
      if (data.workplace || data.graduatedUniversity || data.professionalBio) {
        updates.nutritionistProfile = {
          workplace: data.workplace || '',
          graduatedUniversity: data.graduatedUniversity || '',
          professionalBio: data.professionalBio || ''
        };
      }

      if (Object.keys(updates).length > 0) {
        await UserModel.findByIdAndUpdate(newUser._id, updates);
      }

      // Send certificate pending email
      if (certificate) {
        sendMail({
          to: newUser.email,
          subject: 'Chứng chỉ của bạn đang chờ duyệt',
          template: 'certificate-pending',
          templateData: {
            name: newUser.name,
            certificateName:
              (data as any).certificateName || certificate.originalname
          }
        }).catch(err => {
          console.error(
            'Không thể gửi email thông báo chờ duyệt chứng chỉ:',
            err
          );
        });
      }
    }

    // Send welcome email for all new registrations
    if (data.role === ROLE.NUTRITIONIST) {
      sendMail({
        to: newUser.email,
        subject: 'Chào mừng bạn đến với PNRS',
        template: 'nutritionist-welcome',
        templateData: {
          name: newUser.name,
          email: newUser.email,
          loginUrl: `${process.env.CLIENT_URL}/auth/sign-in`
        }
      }).catch(err => {
        console.error(
          'Không thể gửi email chào mừng chuyên gia dinh dưỡng:',
          err
        );
      });
    }

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
      throw createHttpError(401, 'Token không được cung cấp');
    }

    const decoded = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
      TOKEN_TYPE.REFRESH
    );

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
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
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    const resetToken = generateResetPasswordToken(user._id.toString());

    sendMail({
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      template: 'password-reset',
      templateData: {
        name: user.name,
        resetUrl: `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`
      }
    }).catch(error => {
      console.error('Không thể gửi email đặt lại mật khẩu:', error);
    });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    const storedLastResetToken = await AuthModel.findOne({
      lastResetPasswordToken: token
    });

    if (storedLastResetToken) {
      throw createHttpError(400, 'Token đã được sử dụng');
    }

    const decoded = verifyToken(
      token,
      process.env.JWT_RESET_PASSWORD_SECRET!,
      TOKEN_TYPE.RESET_PASSWORD
    );

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    const hashedPassword = await hashPassword(password);
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
    throw createHttpError(400, 'Tài khoản với email này đã tồn tại');
  }

  const newUser = await UserModel.create({
    ...data,
    isActive: true
  });

  if (!newUser) {
    throw createHttpError(500, 'Không thể hoàn tất đăng ký vào lúc này');
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
      throw createHttpError(500, 'Không thể tải lên ảnh đại diện');
    }
  }
  return newUser;
};
