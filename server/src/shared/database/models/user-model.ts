import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { ALLERGEN } from '~/shared/constants/allergen';
import { AVAILABLE_TIME } from '~/shared/constants/available-time';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { COOKING_PREFERENCE } from '~/shared/constants/cooking-preference';
import { DIET } from '~/shared/constants/diet';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { GENDER } from '~/shared/constants/gender';
import { MEAL_COMPLEXITY } from '~/shared/constants/meal-complexity';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { ROLE } from '~/shared/constants/role';
import { USER_RANK } from '~/shared/constants/user-rank';
import { USER_TARGET } from '~/shared/constants/user-target';

const certificateSchema = new Schema(
  {
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CERTIFICATE_STATUS),
      default: CERTIFICATE_STATUS.PENDING
    },
    showCertificate: { type: Boolean, default: true },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date }
  },
  { _id: false }
);

const macroRangeSchema = new Schema(
  {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  {
    _id: false,
    validate: {
      validator(value: { min: number; max: number }) {
        return value.max >= value.min;
      },
      message: 'max must be greater than or equal to min'
    }
  }
);

const nutritionTargetSchema = new Schema(
  {
    caloriesTarget: { type: Number, required: true, min: 0 },
    macros: {
      carbs: { type: macroRangeSchema, required: true },
      protein: { type: macroRangeSchema, required: true },
      fat: { type: macroRangeSchema, required: true }
    },
    algorithm: { type: String, default: 'calorie-based-v1' },
    recommendationMeta: { type: Map, of: Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const mealSettingSchema = new Schema(
  {
    name: { type: String, required: true },
    mealSize: { type: String, enum: Object.values(MEAL_SIZE), required: true },
    preferredTypes: [
      { type: String, enum: Object.values(MEAL_TYPE), required: true }
    ],
    cookingPreference: {
      type: String,
      enum: Object.values(COOKING_PREFERENCE),
      required: true
    },
    availableTime: {
      type: String,
      enum: Object.values(AVAILABLE_TIME),
      required: true
    },
    complexity: {
      type: String,
      enum: Object.values(MEAL_COMPLEXITY),
      required: true
    },
    dishCategories: [{ type: String, enum: Object.values(DISH_CATEGORY) }],
    ruleOverrides: { type: Map, of: Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const nutritionistProfileSchema = new Schema(
  {
    workplace: { type: String, required: true },
    graduatedUniversity: { type: String, required: true },
    professionalBio: { type: String }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    gender: { type: String, enum: Object.values(GENDER) },
    role: {
      type: String,
      enum: Object.values(ROLE),
      required: true,
      default: ROLE.USER
    },
    dob: { type: Date },
    membershipLevel: { type: String, enum: Object.values(MEMBERSHIP_LEVEL) },
    membershipExpiresAt: { type: Date },
    aiTokens: { type: Number, default: 0 },
    height: { type: Number },
    bodyfat: { type: String, enum: Object.values(BODYFAT) },
    diet: { type: String, enum: Object.values(DIET) },
    nutritionTarget: { type: nutritionTargetSchema },
    mealSettings: { type: [mealSettingSchema], default: [] },
    favoriteDishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }],
    favoriteIngredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
    favoriteCollections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    blockDishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }],
    blockIngredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
    weightRecord: [
      {
        weight: { type: Number },
        date: { type: Date }
      }
    ],
    goal: {
      target: { type: String, enum: Object.values(USER_TARGET) },
      weightGoal: { type: Number },
      targetWeightChange: { type: Number }
    },
    allergens: [{ type: String, enum: Object.values(ALLERGEN) }],
    activityLevel: { type: String, enum: Object.values(ACTIVITY_LEVEL) },
    medicalHistory: { type: [String], default: [] },
    loginStreak: {
      count: { type: Number, default: 0 },
      lastLoginDate: { type: Date }
    },
    rank: { type: String, enum: Object.values(USER_RANK) },
    achievements: [
      {
        key: { type: String },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],
    setting: { type: Map, of: Schema.Types.Mixed, default: {} },
    aiConfig: { type: Map, of: Schema.Types.Mixed, default: {} },
    hasOnboarded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    certificate: { type: certificateSchema, default: null },
    nutritionistProfile: { type: nutritionistProfileSchema }
  },
  {
    timestamps: true
  }
);

userSchema.plugin(mongoosePaginate);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model(
  'User',
  userSchema
) as PaginateModel<User>;
