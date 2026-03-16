import type { QueryOptions } from '@quarks/mongoose-query-parser';
import generatePassword from 'generate-password';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { DIET } from '~/shared/constants/diet';
import { GENDER } from '~/shared/constants/gender';
import { USER_TARGET } from '~/shared/constants/user-target';
import {
  AuthModel,
  GroceryModel,
  PostModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import type { User } from '~/shared/database/models/user-model';
import {
  buildPaginateOptions,
  deleteAvatar,
  generateToken,
  hashPassword,
  sendMail,
  uploadAvatar,
  validateObjectId
} from '~/shared/utils';

import {
  CreateUserRequest,
  NutritionTargetRequest,
  OnboardingRequest,
  UpdateAllergens,
  UpdateNutritionTarget,
  UpdatePhysicalStats,
  UpdateProfile,
  UpdateRestrictions,
  UpdateScheduleSettings,
  UpdateUserRequest
} from './user-dto';

type UpdateProfileRequest =
  | UpdateProfile
  | UpdatePhysicalStats
  | UpdateNutritionTarget
  | UpdateRestrictions
  | UpdateAllergens
  | UpdateScheduleSettings;

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
    throw createHttpError(400, 'Ngày sinh hoặc tuổi là bắt buộc');
  }

  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'Định dạng ngày sinh không hợp lệ');
  }

  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }

  if (years < 0) {
    throw createHttpError(400, 'Ngày sinh không hợp lệ');
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
  addFavoriteDish: async (userId: string, dishId: string) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteDishes: dishId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  removeFavoriteDish: async (userId: string, dishId: string) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteDishes: dishId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  addFavoriteIngredient: async (userId: string, ingredientId: string) => {
    if (!validateObjectId(ingredientId)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteIngredients: ingredientId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  removeFavoriteIngredient: async (userId: string, ingredientId: string) => {
    if (!validateObjectId(ingredientId)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteIngredients: ingredientId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  addFavoriteCollection: async (userId: string, collectionId: string) => {
    if (!validateObjectId(collectionId)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteCollections: collectionId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  removeFavoriteCollection: async (userId: string, collectionId: string) => {
    if (!validateObjectId(collectionId)) {
      throw createHttpError(400, 'Định dạng ID bộ sưu tập không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteCollections: collectionId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  addBlockDish: async (userId: string, dishId: string) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { blockDishes: dishId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  removeBlockDish: async (userId: string, dishId: string) => {
    if (!validateObjectId(dishId)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { blockDishes: dishId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  addBlockIngredient: async (userId: string, ingredientId: string) => {
    if (!validateObjectId(ingredientId)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { blockIngredients: ingredientId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  removeBlockIngredient: async (userId: string, ingredientId: string) => {
    if (!validateObjectId(ingredientId)) {
      throw createHttpError(400, 'Định dạng ID nguyên liệu không hợp lệ');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { blockIngredients: ingredientId } },
      { new: true }
    );

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },
  createUser: async (data: CreateUserRequest) => {
    const newUser = await UserModel.create(data);
    if (!newUser) {
      throw createHttpError(500, 'Không thể tạo người dùng');
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
      subject: 'Chào mừng bạn đến với nền tảng của chúng tôi',
      template: 'create-user',
      templateData: {
        email: newUser.email,
        password
      }
    });

    return newUser;
  },

  viewUsers: async (parsed: QueryOptions): Promise<PaginateResult<User>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await UserModel.paginate(filter, options);

    if (!result || result.totalDocs === 0) {
      throw createHttpError(404, 'Không tìm thấy người dùng nào');
    }

    return result;
  },

  viewProfile: async (id: string) => {
    const user = await UserModel.findById(id)
      .populate({
        path: 'favoriteDishes',
        select:
          'name description image tags preparationTime cookTime servings nutrition user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'favoriteIngredients',
        select: 'name description category image baseUnit nutrition isActive'
      })
      .populate({
        path: 'favoriteCollections',
        select: 'name description image isPublic tags user dishes',
        populate: [
          {
            path: 'user',
            select: 'name'
          },
          {
            path: 'dishes',
            select: 'name image nutrition',
            options: { limit: 1 }
          }
        ]
      })
      .populate({
        path: 'blockDishes',
        select:
          'name description image tags preparationTime cookTime servings nutrition user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'blockIngredients',
        select: 'name description category image baseUnit nutrition isActive'
      })
      .select('-password');

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return user;
  },

  onboardUser: async (id: string, data: OnboardingRequest) => {
    const user = await UserModel.findById(id);

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    if (user.hasOnboarded) {
      throw createHttpError(400, 'Người dùng đã hoàn thành onboarding');
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
      throw createHttpError(400, 'Mức hoạt động không hợp lệ');
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
    const { weight, ...rest } = data as UpdatePhysicalStats;

    const updateOp = weight
      ? { $set: rest, $push: { weightRecord: { weight, date: new Date() } } }
      : rest;

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateOp, {
      new: true
    });

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    if (avatar) {
      await replaceUserAvatar(updatedUser, avatar);
    }

    return updatedUser;
  },

  viewUserDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return user;
  },

  updateUser: async (
    id: string,
    data: UpdateUserRequest,
    currentUserId: string
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    if (id === currentUserId && data.isActive === 'false') {
      throw createHttpError(
        400,
        'Admin không thể vô hiệu hóa tài khoản của chính mình'
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    return updatedUser;
  },

  deleteUser: async (id: string, currentUserId: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
    }

    if (id === currentUserId) {
      throw createHttpError(
        400,
        'Admin không thể xóa tài khoản của chính mình'
      );
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw createHttpError(404, 'Không tìm thấy người dùng');
    }

    await Promise.all([
      AuthModel.deleteMany({ user: id }),
      GroceryModel.deleteMany({ 'user._id': id }),
      ScheduleModel.deleteMany({ 'user._id': id }),
      PostModel.updateMany({ likes: id }, { $pull: { likes: id } }),
      PostModel.updateMany(
        { 'comments.author._id': id },
        { $pull: { comments: { 'author._id': id } } }
      )
    ]);

    return deletedUser;
  },

  deleteBulk: async (ids: string[], currentUserId: string) => {
    ids.forEach(id => {
      if (!validateObjectId(id)) {
        throw createHttpError(400, 'Định dạng ID người dùng không hợp lệ');
      }
    });

    if (ids.includes(currentUserId)) {
      throw createHttpError(400, 'Không thể xóa tài khoản của chính mình');
    }

    const result = await UserModel.deleteMany({ _id: { $in: ids } });

    await Promise.all([
      AuthModel.deleteMany({ user: { $in: ids } }),
      GroceryModel.deleteMany({ 'user._id': { $in: ids } }),
      ScheduleModel.deleteMany({ 'user._id': { $in: ids } }),
      PostModel.updateMany(
        { likes: { $in: ids } },
        { $pull: { likes: { $in: ids } } }
      ),
      PostModel.updateMany(
        { 'comments.author._id': { $in: ids } },
        { $pull: { comments: { 'author._id': { $in: ids } } } }
      )
    ]);

    return result;
  }
};

async function saveUserAvatar(
  user: HydratedDocument<User>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadAvatar(file.buffer, user._id.toString());
  if (uploadResult.success && uploadResult.data) {
    user.avatar = uploadResult.data.secure_url;
    await user.save();
  } else {
    throw createHttpError(500, 'Không thể tải lên ảnh đại diện');
  }
}

async function replaceUserAvatar(
  user: HydratedDocument<User>,
  file: Express.Multer.File
) {
  await deleteAvatar(user._id.toString());
  await saveUserAvatar(user, file);
}
