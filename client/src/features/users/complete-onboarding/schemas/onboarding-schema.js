import * as yup from 'yup';

import { ALLERGEN } from '~/constants/allergen';
// import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { BODYFAT } from '~/constants/bodyfat';
import { DIET } from '~/constants/diet';
import { GENDER } from '~/constants/gender';
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
  name: yup
    .string()
    .oneOf(getEnumValues(MEAL_TYPE), 'Loại bữa ăn không hợp lệ')
    .required('Loại bữa ăn là bắt buộc'),
  categories: yup
    .array()
    .of(yup.string().trim())
    .min(1, 'Phải chọn ít nhất một danh mục')
    .required('Danh mục bữa ăn là bắt buộc')
});

export const onboardingSchema = yup.object({
  diet: yup
    .string()
    .oneOf(getEnumValues(DIET), 'Chế độ ăn không hợp lệ')
    .required('Chế độ ăn là bắt buộc'),
  allergens: yup
    .array()
    .of(yup.string().oneOf(getEnumValues(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional(),
  medicalHistory: yup.array().of(yup.string().trim()).optional(),

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
    .positive('Chiều cao phải là số dương')
    .required('Chiều cao là bắt buộc'),
  weight: yup
    .number()
    .positive('Cân nặng phải là số dương')
    .required('Cân nặng là bắt buộc'),
  bodyfat: yup
    .string()
    .oneOf(getEnumValues(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ')
    .required('Mức độ mỡ cơ thể là bắt buộc'),
  // TODO: Backend team to add activityLevel field
  // activityLevel: yup
  //   .string()
  //   .oneOf(getEnumValues(ACTIVITY_LEVEL), 'Mức độ hoạt động không hợp lệ')
  //   .required('Mức độ hoạt động là bắt buộc'),

  goal: yup
    .object({
      target: yup
        .string()
        .oneOf(getEnumValues(USER_TARGET), 'Mục tiêu không hợp lệ')
        .required('Mục tiêu là bắt buộc'),
      weightGoal: yup.number().optional(),
      targetWeightChange: yup.number().optional()
    })
    .optional(),
  nutritionTarget: nutritionTargetSchema.optional(),
  mealSetting: yup.array().of(mealSettingSchema).optional()
});
