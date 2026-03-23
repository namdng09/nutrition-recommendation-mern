import { z } from 'zod';

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
import { ROLE } from '~/shared/constants/role';
import { USER_TARGET } from '~/shared/constants/user-target';

const macroRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0)
  })
  .refine(value => value.max >= value.min, {
    message: 'Giá trị tối đa phải lớn hơn hoặc bằng giá trị tối thiểu'
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
  name: z.string().min(1, 'Tên bữa ăn là bắt buộc'),
  dishCategories: z.array(
    z.enum(Object.values(DISH_CATEGORY), 'Danh mục món ăn không hợp lệ')
  ),
  cookingPreference: z.enum(
    Object.values(COOKING_PREFERENCE),
    'Sở thích nấu ăn không hợp lệ'
  ),
  mealSize: z.enum(Object.values(MEAL_SIZE), 'Kích thước bữa ăn không hợp lệ'),
  availableTime: z.enum(
    Object.values(AVAILABLE_TIME),
    'Thời gian sẵn có không hợp lệ'
  ),
  complexity: z.enum(
    Object.values(MEAL_COMPLEXITY),
    'Độ phức tạp bữa ăn không hợp lệ'
  )
});

const updateMealSettingSchema = z.object({
  name: z.enum(Object.values(MEAL_TYPE), 'Loại bữa ăn không hợp lệ'),
  dishCategories: z
    .array(z.enum(Object.values(DISH_CATEGORY), 'Danh mục món ăn không hợp lệ'))
    .min(1, 'Phải chọn ít nhất một danh mục món ăn'),
  cookingPreference: z.enum(
    Object.values(COOKING_PREFERENCE),
    'Sở thích nấu ăn không hợp lệ'
  ),
  mealSize: z.enum(Object.values(MEAL_SIZE), 'Kích thước bữa ăn không hợp lệ'),
  availableTime: z.enum(
    Object.values(AVAILABLE_TIME),
    'Thời gian sẵn có không hợp lệ'
  ),
  complexity: z.enum(
    Object.values(MEAL_COMPLEXITY),
    'Độ phức tạp bữa ăn không hợp lệ'
  )
});

export const nutritionTargetRequestSchema = z.object({
  diet: z.enum(Object.values(DIET), 'Chế độ ăn không hợp lệ'),
  allergens: z
    .array(z.enum(Object.values(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional(),
  gender: z.enum(Object.values(GENDER), 'Giới tính không hợp lệ'),
  height: z.number().positive(),
  weight: z.number().positive(),
  dob: z.string().optional(),
  age: z.number().positive().optional(),
  bodyfat: z.enum(Object.values(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ'),
  activityLevel: z.enum(
    Object.values(ACTIVITY_LEVEL),
    'Mức độ hoạt động không hợp lệ'
  ),
  goal: z
    .object({
      target: z.enum(Object.values(USER_TARGET), 'Mục tiêu không hợp lệ'),
      weightGoal: z.number().optional(),
      targetWeightChange: z.number().optional()
    })
    .optional()
});

export type NutritionTargetRequest = z.infer<
  typeof nutritionTargetRequestSchema
>;

export const createUserRequestSchema = z.object({
  email: z.email('Địa chỉ email không hợp lệ'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  gender: z.enum(Object.values(GENDER), 'Giới tính không hợp lệ'),
  role: z.enum(Object.values(ROLE), 'Vai trò không hợp lệ'),
  dob: z.string().optional()
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateUserRequestSchema = z.object({
  email: z.email('Địa chỉ email không hợp lệ').optional(),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  avatar: z.file().optional(),
  gender: z.enum(Object.values(GENDER), 'Giới tính không hợp lệ').optional(),
  role: z.enum(Object.values(ROLE), 'Vai trò không hợp lệ').optional(),
  dob: z.string().optional(),
  isActive: z
    .enum(['true', 'false'], 'Giá trị trạng thái hoạt động không hợp lệ')
    .optional()
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export const onboardingRequestSchema = z.object({
  gender: z.enum(Object.values(GENDER), 'Giới tính không hợp lệ'),
  dob: z.string(),
  height: z.number().positive(),
  weight: z.number().positive(),
  bodyfat: z.enum(Object.values(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ'),
  diet: z.enum(Object.values(DIET), 'Chế độ ăn không hợp lệ'),
  allergens: z
    .array(z.enum(Object.values(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional(),
  medicalHistory: z.array(z.string().trim()).optional(),
  nutritionTarget: nutritionTargetSchema.optional(),
  mealSettings: z
    .array(mealSettingSchema)
    .min(1, 'Phải có ít nhất một bữa ăn')
    .max(10, 'Chỉ được có tối đa 10 bữa ăn'),
  activityLevel: z.enum(
    Object.values(ACTIVITY_LEVEL),
    'Mức độ hoạt động không hợp lệ'
  ),
  goal: z
    .object({
      target: z.enum(Object.values(USER_TARGET), 'Mục tiêu không hợp lệ'),
      weightGoal: z.number().optional(),
      targetWeightChange: z.number().optional()
    })
    .optional()
});

export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  avatar: z
    .file()
    .refine(
      f => f.size <= 5 * 1024 * 1024,
      'Kích thước tệp quá lớn (tối đa 5MB)'
    )
    .refine(f => f.type.startsWith('image/'), 'Chỉ chấp nhận tệp hình ảnh')
    .optional()
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export const updatePhysicalStatsSchema = z.object({
  gender: z.enum(Object.values(GENDER), 'Giới tính không hợp lệ'),
  dob: z
    .string()
    .refine(
      v => !isNaN(new Date(v).getTime()),
      'Định dạng ngày sinh không hợp lệ'
    ),
  height: z.number().positive(),
  weight: z.number().positive(),
  bodyfat: z.enum(Object.values(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ'),
  activityLevel: z.enum(
    Object.values(ACTIVITY_LEVEL),
    'Mức độ hoạt động không hợp lệ'
  ),
  medicalHistory: z.array(z.string().trim()).optional()
});

export type UpdatePhysicalStats = z.infer<typeof updatePhysicalStatsSchema>;

export const updateNutritionTargetSchema = z.object({
  goal: z.object({
    target: z.enum(Object.values(USER_TARGET), 'Mục tiêu không hợp lệ'),
    weightGoal: z.number().positive().optional(),
    targetWeightChange: z.number().optional()
  }),
  nutritionTarget: z
    .object({
      caloriesTarget: z.number().min(0).optional(),
      macros: z
        .object({
          carbs: z.object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional()
          }),
          protein: z.object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional()
          }),
          fat: z.object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional()
          })
        })
        .optional()
    })
    .optional()
});

export type UpdateNutritionTarget = z.infer<typeof updateNutritionTargetSchema>;

export const updateRestrictionsSchema = z.object({
  diet: z.enum(Object.values(DIET), 'Chế độ ăn không hợp lệ')
});

export type UpdateRestrictions = z.infer<typeof updateRestrictionsSchema>;

export const updateAllergensSchema = z.object({
  allergens: z
    .array(z.enum(Object.values(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional()
});

export type UpdateAllergens = z.infer<typeof updateAllergensSchema>;

export const updateScheduleSettingsSchema = z.object({
  mealSettings: z
    .array(updateMealSettingSchema)
    .min(1, 'Phải có ít nhất một cài đặt bữa ăn')
});

export type UpdateScheduleSettings = z.infer<
  typeof updateScheduleSettingsSchema
>;

export const favoriteDishRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn không được để trống')
});

export type FavoriteDishRequest = z.infer<typeof favoriteDishRequestSchema>;

export const favoriteIngredientRequestSchema = z.object({
  ingredientId: z.string().trim().min(1, 'ID nguyên liệu không được để trống')
});

export type FavoriteIngredientRequest = z.infer<
  typeof favoriteIngredientRequestSchema
>;

export const favoriteCollectionRequestSchema = z.object({
  collectionId: z.string().trim().min(1, 'ID bộ sưu tập không được để trống')
});

export type FavoriteCollectionRequest = z.infer<
  typeof favoriteCollectionRequestSchema
>;

export const blockDishRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn không được để trống')
});

export type BlockDishRequest = z.infer<typeof blockDishRequestSchema>;

export const blockIngredientRequestSchema = z.object({
  ingredientId: z.string().trim().min(1, 'ID nguyên liệu không được để trống')
});

export type BlockIngredientRequest = z.infer<
  typeof blockIngredientRequestSchema
>;

export const deleteBulkRequestSchema = z.object({
  ids: z
    .array(z.string().trim().min(1, 'ID người dùng không được để trống'))
    .min(1, 'Cần ít nhất một ID người dùng')
});

export type DeleteBulkRequest = z.infer<typeof deleteBulkRequestSchema>;

export const uploadCertificateRequestSchema = z.object({
  certificateName: z.string().min(1, 'Tên chứng chỉ không được để trống').trim()
});

export type UploadCertificateRequest = z.infer<
  typeof uploadCertificateRequestSchema
>;

export const rejectCertificateRequestSchema = z.object({
  rejectionReason: z.string().min(1, 'Lý do từ chối không được để trống').trim()
});

export type RejectCertificateRequest = z.infer<
  typeof rejectCertificateRequestSchema
>;

export const updateNutritionistProfileSchema = z.object({
  workplace: z.string().min(2, 'Nơi làm việc phải có ít nhất 2 ký tự'),
  graduatedUniversity: z
    .string()
    .min(2, 'Trường đại học phải có ít nhất 2 ký tự'),
  professionalBio: z
    .string()
    .max(500, 'Tiểu sử không được vượt quá 500 ký tự')
    .optional()
});

export type UpdateNutritionistProfile = z.infer<
  typeof updateNutritionistProfileSchema
>;
