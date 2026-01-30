import type { QueryOptions } from '@quarks/mongoose-query-parser';
import generatePassword from 'generate-password';
import createHttpError from 'http-errors';

import { AuthModel, UserModel } from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
import {
  buildPaginateOptions,
  deleteAvatar,
  hashPassword,
  type PaginateResponse,
  sendMail,
  uploadAvatar,
  validateObjectId
} from '~/shared/utils';

import {
  CreateUserRequest,
  OnboardingRequest,
  UpdateProfileRequest,
  UpdateUserRequest
} from './user-dto';

export const UserService = {
  createUser: async (data: CreateUserRequest) => {
    const newUser = await UserModel.create(data);
    if (!newUser) {
      throw createHttpError(500, 'Failed to create user');
    }

    const password = generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true
    });
    const hashedPassword = await hashPassword(password);

    await AuthModel.create({
      user: newUser._id,
      provider: 'local',
      providerId: newUser.email,
      localPassword: hashedPassword,
      verifyAt: new Date()
    });

    sendMail({
      to: newUser.email,
      subject: 'Welcome to Our Platform',
      template: 'create-user',
      templateData: {
        email: newUser.email,
        password
      }
    });

    return newUser;
  },

  viewUsers: async (parsed: QueryOptions): Promise<PaginateResponse<User>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await UserModel.paginate(filter, options);

    if (!result || result.totalDocs === 0) {
      throw createHttpError(404, 'No users found');
    }

    return result as unknown as PaginateResponse<User>;
  },

  viewProfile: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return user;
  },

  onboardUser: async (id: string, data: OnboardingRequest) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    if (user.hasOnboarded) {
      throw createHttpError(400, 'User already onboarded');
    }

    const { weight, ...rest } = data;
    user.set(rest);
    if (weight !== undefined) {
      user.weightRecord = [{ weight, date: new Date() }];
    }
    user.hasOnboarded = true;

    await user.save();

    return user;
  },

  updateProfile: async (
    id: string,
    data: UpdateProfileRequest,
    avatar?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    if (avatar) {
      await deleteAvatar(updatedUser._id.toString());

      const uploadResult = await uploadAvatar(
        avatar.buffer,
        updatedUser._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        updatedUser.avatar = uploadResult.data.secure_url;
        await updatedUser.save();
      } else {
        throw createHttpError(500, 'Failed to upload avatar');
      }
    }

    return updatedUser;
  },

  viewUserDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return user;
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    return updatedUser;
  },

  deleteUser: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw createHttpError(404, 'User not found');
    }

    await AuthModel.deleteMany({ user: deletedUser._id });

    return deletedUser;
  },

  deleteBulk: async (ids: string[]) => {
    ids.forEach(id => {
      if (!validateObjectId(id)) {
        throw createHttpError(400, 'Invalid user ID format');
      }
    });

    const result = await UserModel.deleteMany({ _id: { $in: ids } });

    await AuthModel.deleteMany({ user: { $in: ids } });

    return result;
  }
};
