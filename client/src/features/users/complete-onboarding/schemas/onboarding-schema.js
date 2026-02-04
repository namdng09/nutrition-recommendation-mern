import * as yup from 'yup';

import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { ALLERGEN } from '~/constants/allergen';
import { AVAILABLE_TIME } from '~/constants/available-time';
import { BODYFAT } from '~/constants/bodyfat';
import { COOKING_PREFERENCE } from '~/constants/cooking-preference';
import { DIET } from '~/constants/diet';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { GENDER } from '~/constants/gender';
import { MEAL_COMPLEXITY } from '~/constants/meal-complexity';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE } from '~/constants/meal-type';
import { USER_TARGET } from '~/constants/user-target';

const getEnumValues = obj => Object.values(obj);

const macroRangeSchema = yup
  .object({
    min: yup.number().min(0).required('Giá trị tối thiểu là bắt buộc'),
    max: yup.number().min(0).required('Giá trị tối đa là bắt buộc')
  })
  .test(
    'min-max-validation',
    'Giá trị tối đa phải lớn hơn hoặc bằng giá trị tối thiểu',
    function (value) {
      if (!value) return true;
      return value.max >= value.min;
    }
  );

const nutritionTargetSchema = yup.object({
  caloriesTarget: yup
    .number()
    .min(0, 'Mục tiêu calo phải lớn hơn 0')
    .required('Mục tiêu calo là bắt buộc'),
  macros: yup.object({
    carbs: macroRangeSchema.required('Carbs là bắt buộc'),
    protein: macroRangeSchema.required('Protein là bắt buộc'),
    fat: macroRangeSchema.required('Chất béo là bắt buộc')
  })
});

const mealSettingSchema = yup.object({
  name: yup.string().required('Tên bữa ăn là bắt buộc'),
  dishCategories: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(getEnumValues(DISH_CATEGORY), 'Danh mục món ăn không hợp lệ')
    )
    .min(1, 'Phải chọn ít nhất một danh mục món ăn')
    .required('Danh mục món ăn là bắt buộc'),
  cookingPreference: yup
    .string()
    .oneOf(getEnumValues(COOKING_PREFERENCE), 'Sở thích nấu ăn không hợp lệ')
    .required('Sở thích nấu ăn là bắt buộc'),
  mealSize: yup
    .string()
    .oneOf(getEnumValues(MEAL_SIZE), 'Kích thước bữa ăn không hợp lệ')
    .required('Kích thước bữa ăn là bắt buộc'),
  availableTime: yup
    .string()
    .oneOf(getEnumValues(AVAILABLE_TIME), 'Thời gian sẵn có không hợp lệ')
    .required('Thời gian sẵn có là bắt buộc'),
  complexity: yup
    .string()
    .oneOf(getEnumValues(MEAL_COMPLEXITY), 'Độ phức tạp không hợp lệ')
    .required('Độ phức tạp là bắt buộc')
});

export const stepOneSchema = yup.object({
  diet: yup
    .string()
    .oneOf(getEnumValues(DIET), 'Chế độ ăn không hợp lệ')
    .required('Chế độ ăn là bắt buộc'),
  allergens: yup
    .array()
    .of(yup.string().oneOf(getEnumValues(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional(),
  medicalHistory: yup.array().of(yup.string().trim()).optional()
});

export const stepTwoOneSchema = yup.object({
  gender: yup
    .string()
    .oneOf(getEnumValues(GENDER), 'Giới tính không hợp lệ')
    .required('Giới tính là bắt buộc'),
  dob: yup
    .string()
    .required('Ngày sinh là bắt buộc')
    .test('is-valid-date', 'Ngày sinh không hợp lệ', value => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  height: yup
    .number()
    .typeError('Chiều cao phải là số')
    .positive('Chiều cao phải là số dương')
    .required('Chiều cao là bắt buộc'),
  weight: yup
    .number()
    .typeError('Cân nặng phải là số')
    .positive('Cân nặng phải là số dương')
    .required('Cân nặng là bắt buộc'),
  bodyfat: yup
    .string()
    .oneOf(getEnumValues(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ')
    .required('Mức độ mỡ cơ thể là bắt buộc'),
  activityLevel: yup
    .string()
    .oneOf(getEnumValues(ACTIVITY_LEVEL), 'Mức độ hoạt động không hợp lệ')
    .required('Mức độ hoạt động là bắt buộc')
});

const goalSchema = yup.object({
  mode: yup.string().oneOf(['generic', 'exact']).default('generic'),
  target: yup
    .string()
    .oneOf(getEnumValues(USER_TARGET), 'Mục tiêu không hợp lệ')
    .required('Mục tiêu là bắt buộc'),
  weightGoal: yup.number().when('mode', {
    is: 'exact',
    then: schema =>
      schema
        .typeError('Cân nặng mục tiêu phải là số')
        .positive('Cân nặng mục tiêu phải là số dương')
        .required('Cân nặng mục tiêu là bắt buộc'),
    otherwise: schema =>
      schema
        .transform(value => (isNaN(value) ? undefined : value))
        .notRequired()
        .nullable()
  }),
  targetWeightChange: yup.number().when('mode', {
    is: 'exact',
    then: schema =>
      schema
        .typeError('Tốc độ thay đổi phải là số')
        .positive('Tốc độ thay đổi phải là số dương')
        .required('Tốc độ thay đổi là bắt buộc'),
    otherwise: schema =>
      schema
        .transform(value => (isNaN(value) ? undefined : value))
        .notRequired()
        .nullable()
  })
});

export const stepTwoTwoSchema = yup.object({
  goal: goalSchema
});

export const stepTwoSchema = stepTwoOneSchema.concat(stepTwoTwoSchema);

export const stepThreeSchema = yup.object({
  goal: goalSchema,
  nutritionTarget: nutritionTargetSchema.optional(),
  mealSettings: yup
    .array()
    .of(mealSettingSchema)
    .min(1, 'Phải có ít nhất một bữa ăn')
    .max(10, 'Tối đa 10 bữa ăn')
    .required('Cài đặt bữa ăn là bắt buộc')
});

export const stepFourSchema = yup.object({});

export const onboardingSchema = stepOneSchema
  .concat(stepTwoSchema)
  .concat(stepThreeSchema)
  .concat(stepFourSchema);
