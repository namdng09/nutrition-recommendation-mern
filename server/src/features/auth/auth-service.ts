import createHttpError from 'http-errors';
import { HydratedDocument } from 'mongoose';

import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { ROLE } from '~/shared/constants/role';
import { TOKEN_TYPE } from '~/shared/constants/token-type';
import { AuthModel, UserModel } from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
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
  ForgotPasswordRequest,
  type LoginRequest,
  type LoginResponse,
  type LoginWithProviderResponse,
  ResetPasswordRequest,
  type SignUpRequest,
  type SignUpResponse,
  type ValidatedNutritionistSignUpRequest
} from './auth-dto';

export const AuthService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
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

    await user.save();

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

    await user.save();

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

    let nutritionistProfile:
      | {
          workplace: string;
          graduatedUniversity: string;
          professionalBio?: string;
        }
      | undefined;
    let nutritionistCertificate:
      | {
          name: string;
          fileUrl: string;
          publicId: string;
          status: (typeof CERTIFICATE_STATUS)[keyof typeof CERTIFICATE_STATUS];
        }
      | undefined;

    if (data.role === ROLE.NUTRITIONIST) {
      const nutritionistData = data as ValidatedNutritionistSignUpRequest;

      nutritionistProfile = {
        workplace: nutritionistData.workplace,
        graduatedUniversity: nutritionistData.graduatedUniversity,
        professionalBio: nutritionistData.professionalBio
      };

      if (certificate) {
        const certificateName = nutritionistData.certificateName;
        const certUpload = await uploadCertificate(
          certificate.buffer,
          data.email
        );

        if (!certUpload.success || !certUpload.data) {
          throw createHttpError(500, 'Không thể tải lên chứng chỉ');
        }

        nutritionistCertificate = {
          name: certificateName,
          fileUrl: certUpload.data.secure_url,
          publicId: certUpload.data.public_id,
          status: CERTIFICATE_STATUS.PENDING
        };
      }
    }

    const newUser = await createNewUser(
      data,
      avatar,
      nutritionistProfile,
      nutritionistCertificate
    );
    const hashedPassword = await hashPassword(data.password);

    await AuthModel.create({
      user: newUser._id,
      provider: 'local',
      providerId: data.email,
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    if (data.role === ROLE.NUTRITIONIST) {
      if (nutritionistCertificate) {
        sendMail({
          to: newUser.email,
          subject: 'Chứng chỉ của bạn đang chờ duyệt',
          template: 'certificate-pending',
          templateData: {
            name: newUser.name,
            certificateName: nutritionistCertificate.name
          }
        }).catch(err => {
          console.error(
            'Không thể gửi email thông báo chờ duyệt chứng chỉ:',
            err
          );
        });
      }

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

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    const email = data.email;

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

  resetPassword: async (
    token: string,
    data: ResetPasswordRequest
  ): Promise<void> => {
    const password = data.password;

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
  avatar?: Express.Multer.File,
  nutritionistProfile?: {
    workplace: string;
    graduatedUniversity: string;
    professionalBio?: string;
  },
  nutritionistCertificate?: {
    name: string;
    fileUrl: string;
    publicId: string;
    status: (typeof CERTIFICATE_STATUS)[keyof typeof CERTIFICATE_STATUS];
  }
) => {
  const existingUser = await UserModel.findOne({ email: data.email });

  if (existingUser) {
    throw createHttpError(400, 'Tài khoản với email này đã tồn tại');
  }

  const userToCreate: Record<string, unknown> = {
    email: data.email,
    name: data.name,
    role: data.role,
    isActive: true
  };

  if (nutritionistProfile) {
    userToCreate.nutritionistProfile = nutritionistProfile;
  }

  if (nutritionistCertificate) {
    userToCreate.certificate = nutritionistCertificate;
  }

  const newUser = await UserModel.create(userToCreate);

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
