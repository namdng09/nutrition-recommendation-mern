import * as yup from 'yup';

import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { ALLERGEN } from '~/constants/allergen';
import { BODYFAT } from '~/constants/bodyfat';
import { DIET } from '~/constants/diet';
import { GENDER } from '~/constants/gender';
import { USER_TARGET } from '~/constants/user-target';

export const updateNutritionTargetSchema = yup.object({
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
  nutritionTarget: yup
    .object({
      caloriesTarget: yup.number().min(0).optional(),
      macros: yup
        .object({
          carbs: yup
            .object({
              min: yup.number().min(0).required(),
              max: yup.number().min(0).required()
            })
            .optional(),
          protein: yup
            .object({
              min: yup.number().min(0).required(),
              max: yup.number().min(0).required()
            })
            .optional(),
          fat: yup
            .object({
              min: yup.number().min(0).required(),
              max: yup.number().min(0).required()
            })
            .optional()
        })
        .optional()
    })
    .optional()
});

export const calculateNutritionSchema = yup.object({
  diet: yup
    .string()
    .oneOf(Object.values(DIET), 'Invalid diet')
    .required('Diet is required'),
  allergens: yup
    .array()
    .of(yup.string().oneOf(Object.values(ALLERGEN), 'Invalid allergen'))
    .optional(),
  gender: yup
    .string()
    .oneOf(Object.values(GENDER), 'Invalid gender')
    .required('Gender is required'),
  height: yup
    .number()
    .positive('Height must be positive')
    .required('Height is required'),
  weight: yup
    .number()
    .positive('Weight must be positive')
    .required('Weight is required'),
  dob: yup.string().optional(),
  age: yup.number().positive().optional(),
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
    .required('Goal is required')
});
