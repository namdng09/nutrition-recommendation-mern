import * as yup from 'yup';

import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { BODYFAT } from '~/constants/bodyfat';
import { USER_TARGET } from '~/constants/user-target';

const macroRangeSchema = yup
  .object({
    min: yup
      .number()
      .min(0, 'Minimum must be at least 0')
      .required('Minimum is required'),
    max: yup
      .number()
      .min(0, 'Maximum must be at least 0')
      .required('Maximum is required')
  })
  .test(
    'min-max',
    'Maximum must be greater than or equal to minimum',
    value => {
      return !value || value.max >= value.min;
    }
  );

export const updateNutritionTargetSchema = yup.object({
  height: yup
    .number()
    .positive('Height must be positive')
    .required('Height is required'),
  weight: yup
    .number()
    .positive('Weight must be positive')
    .required('Weight is required'),
  bodyfat: yup
    .string()
    .oneOf(Object.values(BODYFAT), 'Invalid bodyfat')
    .required('Bodyfat is required'),
  activityLevel: yup
    .string()
    .oneOf(Object.values(ACTIVITY_LEVEL), 'Invalid activity level')
    .required('Activity level is required'),
  goal: yup
    .object({
      target: yup
        .string()
        .oneOf(Object.values(USER_TARGET), 'Invalid target')
        .required('Goal target is required'),
      weightGoal: yup.number().positive().optional(),
      targetWeightChange: yup.number().optional()
    })
    .required('Goal is required'),
  // Manual macro mode fields (optional)
  macroMode: yup.string().oneOf(['auto', 'manual']).optional(),
  nutritionTarget: yup
    .object({
      caloriesTarget: yup.number().min(0).optional(),
      macros: yup
        .object({
          carbs: macroRangeSchema.optional(),
          protein: macroRangeSchema.optional(),
          fat: macroRangeSchema.optional()
        })
        .optional()
    })
    .optional()
});
