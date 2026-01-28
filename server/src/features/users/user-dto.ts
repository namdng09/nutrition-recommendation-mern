import { z } from 'zod';

import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { ALLERGEN } from '~/shared/constants/allergen';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { DIET } from '~/shared/constants/diet';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { GENDER } from '~/shared/constants/gender';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { USER_TARGET } from '~/shared/constants/user-target';

const macroRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0)
  })
  .refine(value => value.max >= value.min, {
    message: 'max must be greater than or equal to min'
  });

const nutritionTargetSchema = z.object({
  caloriesTarget: z.number().min(0),
  macros: z.object({
    carbs: macroRangeSchema,
    protein: macroRangeSchema,
    fat: macroRangeSchema
  })
});

const mealSettingSchema = z.object({
  name: z.enum(Object.values(MEAL_TYPE), { message: 'Invalid meal type' }),
  dishCategories: z.array(
    z.enum(Object.values(DISH_CATEGORY), {
      message: 'Invalid dish category'
    })
  )
});

export const nutritionTargetRequestSchema = z.object({
  diet: z.enum(Object.values(DIET), { message: 'Invalid diet' }),
  allergens: z
    .array(z.enum(Object.values(ALLERGEN), { message: 'Invalid allergen' }))
    .optional(),
  gender: z.enum(Object.values(GENDER), { message: 'Invalid gender' }),
  height: z.number().positive(),
  weight: z.number().positive(),
  dob: z.string().optional(),
  age: z.number().positive().optional(),
  bodyfat: z.enum(Object.values(BODYFAT), { message: 'Invalid bodyfat' }),
  activityLevel: z.enum(Object.values(ACTIVITY_LEVEL), {
    message: 'Invalid activity level'
  }),
  goal: z
    .object({
      target: z.enum(Object.values(USER_TARGET), { message: 'Invalid target' }),
      weightGoal: z.number().optional(),
      targetWeightChange: z.number().optional()
    })
    .optional()
});

export type NutritionTargetRequest = z.infer<
  typeof nutritionTargetRequestSchema
>;

export const createUserRequestSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  gender: z.enum(Object.values(GENDER), { message: 'Invalid gender' }),
  role: z.enum(Object.values(ROLE), { message: 'Invalid role' }),
  dob: z.string().optional()
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateProfileRequestSchema = z.object({
  email: z.email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatar: z.file().optional(),
  gender: z
    .enum(Object.values(GENDER), { message: 'Invalid gender' })
    .optional(),
  dob: z.string().optional()
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const onboardingRequestSchema = z.object({
  gender: z.enum(Object.values(GENDER), { message: 'Invalid gender' }),
  dob: z.string(),
  height: z.number().positive(),
  weight: z.number().positive(),
  bodyfat: z.enum(Object.values(BODYFAT), { message: 'Invalid bodyfat' }),
  diet: z.enum(Object.values(DIET), { message: 'Invalid diet' }),
  allergens: z
    .array(z.enum(Object.values(ALLERGEN), { message: 'Invalid allergen' }))
    .optional(),
  medicalHistory: z.array(z.string().trim()).optional(),
  nutritionTarget: nutritionTargetSchema.optional(),
  mealSetting: z.array(mealSettingSchema).optional(),
  activityLevel: z.enum(Object.values(ACTIVITY_LEVEL), {
    message: 'Invalid Activity Level'
  }),
  goal: z
    .object({
      target: z.enum(Object.values(USER_TARGET), { message: 'Invalid target' }),
      weightGoal: z.number().optional(),
      targetWeightChange: z.number().optional()
    })
    .optional()
});

export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;

export const updateUserRequestSchema = z.object({
  email: z.email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatar: z.file().optional(),
  gender: z
    .enum(Object.values(GENDER), { message: 'Invalid gender' })
    .optional(),
  role: z.enum(Object.values(ROLE), { message: 'Invalid role' }).optional(),
  dob: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional()
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
