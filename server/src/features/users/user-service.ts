import type { QueryOptions } from '@quarks/mongoose-query-parser';
import generatePassword from 'generate-password';
import createHttpError from 'http-errors';

import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { DIET } from '~/shared/constants/diet';
import { GENDER } from '~/shared/constants/gender';
import { USER_TARGET } from '~/shared/constants/user-target';
import { AuthModel, UserModel } from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
import {
  buildPaginateOptions,
  deleteAvatar,
  generateToken,
  hashPassword,
  type PaginateResponse,
  sendMail,
  uploadAvatar,
  validateObjectId
} from '~/shared/utils';

import {
  CreateUserRequest,
  NutritionTargetRequest,
  OnboardingRequest,
  UpdateProfileRequest,
  UpdateUserRequest
} from './user-dto';

const ACTIVITY_MULTIPLIERS: Record<
  (typeof ACTIVITY_LEVEL)[keyof typeof ACTIVITY_LEVEL],
  number
> = {
  [ACTIVITY_LEVEL.DESK_JOB_LIGHT_EXERCISE]: 1.2,
  [ACTIVITY_LEVEL.LIGHTLY_ACTIVE_3_4X_WEEK]: 1.375,
  [ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT]: 1.55,
  [ACTIVITY_LEVEL.VERY_ATHLETIC]: 1.725,
  [ACTIVITY_LEVEL.EXTREMELY_ATHLETIC]: 1.9
};

type MacroRatios = {
  carbs: { min: number; max: number };
  protein: { min: number; max: number };
  fat: { min: number; max: number };
};

const MACRO_RATIOS_BY_DIET: Record<
  (typeof DIET)[keyof typeof DIET],
  MacroRatios
> = {
  [DIET.ANYTHING]: {
    carbs: { min: 0.45, max: 0.55 },
    protein: { min: 0.15, max: 0.25 },
    fat: { min: 0.25, max: 0.35 }
  },
  [DIET.KETO]: {
    carbs: { min: 0.05, max: 0.1 },
    protein: { min: 0.15, max: 0.25 },
    fat: { min: 0.65, max: 0.75 }
  },
  [DIET.MEDITERRANEAN]: {
    carbs: { min: 0.4, max: 0.5 },
    protein: { min: 0.15, max: 0.25 },
    fat: { min: 0.3, max: 0.4 }
  },
  [DIET.PALEO]: {
    carbs: { min: 0.25, max: 0.35 },
    protein: { min: 0.25, max: 0.35 },
    fat: { min: 0.3, max: 0.4 }
  },
  [DIET.VEGAN]: {
    carbs: { min: 0.5, max: 0.6 },
    protein: { min: 0.15, max: 0.25 },
    fat: { min: 0.2, max: 0.3 }
  },
  [DIET.VEGETARIAN]: {
    carbs: { min: 0.5, max: 0.6 },
    protein: { min: 0.15, max: 0.25 },
    fat: { min: 0.2, max: 0.3 }
  }
};

const calculateAge = (dob?: string, age?: number) => {
  if (typeof age === 'number') {
    return Math.floor(age);
  }

  if (!dob) {
    throw createHttpError(400, 'dob or age is required');
  }

  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'Invalid dob format');
  }

  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }

  if (years < 0) {
    throw createHttpError(400, 'Invalid dob');
  }

  return years;
};

const calculateMacros = (calories: number, ratios: MacroRatios) => {
  const carbsMin = Math.round((calories * ratios.carbs.min) / 4);
  const carbsMax = Math.round((calories * ratios.carbs.max) / 4);
  const proteinMin = Math.round((calories * ratios.protein.min) / 4);
  const proteinMax = Math.round((calories * ratios.protein.max) / 4);
  const fatMin = Math.round((calories * ratios.fat.min) / 9);
  const fatMax = Math.round((calories * ratios.fat.max) / 9);

  return {
    carbs: { min: carbsMin, max: carbsMax },
    protein: { min: proteinMin, max: proteinMax },
    fat: { min: fatMin, max: fatMax }
  };
};

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
      user.set('weightRecord', [{ weight, date: new Date() }]);
    }
    user.hasOnboarded = true;

    await user.save();

    const { accessToken, refreshToken } = generateToken({
      id: user._id.toString(),
      role: user.role,
      hasOnboarded: true
    });

    return {
      user,
      accessToken,
      refreshToken,
      hasOnboarded: true
    };
  },

  calculateNutritionTarget: async (data: NutritionTargetRequest) => {
    const age = calculateAge(data.dob, data.age);
    const activityMultiplier = ACTIVITY_MULTIPLIERS[data.activityLevel];

    if (!activityMultiplier) {
      throw createHttpError(400, 'Invalid activity level');
    }

    const baseBmr = 10 * data.weight + 6.25 * data.height - 5 * age;
    let bmr = baseBmr;

    if (data.gender === GENDER.MALE) {
      bmr += 5;
    } else if (data.gender === GENDER.FEMALE) {
      bmr -= 161;
    } else {
      bmr -= 78;
    }

    let caloriesTarget = Math.round(bmr * activityMultiplier);
    let adjustment = 0;

    if (data.goal?.targetWeightChange !== undefined) {
      adjustment = (data.goal.targetWeightChange * 7700) / 7;
    } else if (data.goal?.target === USER_TARGET.LOSE_FAT) {
      adjustment = -500;
    } else if (data.goal?.target === USER_TARGET.BUILD_MUSCLE) {
      adjustment = 300;
    }

    caloriesTarget = Math.max(0, Math.round(caloriesTarget + adjustment));

    const ratios = MACRO_RATIOS_BY_DIET[data.diet];
    const macros = calculateMacros(caloriesTarget, ratios);

    return {
      caloriesTarget,
      macros
    };
  },

  updateProfile: async (
    id: string,
    data: UpdateProfileRequest,
    avatar?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Invalid user ID format');
    }

    const { weight, ...rest } = data;

    const updateOp = weight
      ? { $set: rest, $push: { weightRecord: { weight, date: new Date() } } }
      : rest;

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateOp, {
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
