import { z } from 'zod';

import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import {
  WORKOUT_COUNTER_TYPE,
  WORKOUT_DISTANCE_UNIT
} from '~/shared/constants/workout-counter-type';

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
};

const parseJSON = (val: any) => {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const scheduleDishSchema = z.object({
  dishId: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Tên món ăn là bắt buộc'),
  calories: z.coerce
    .number()
    .min(0, 'Calo phải lớn hơn hoặc bằng 0')
    .optional(),
  servings: z.coerce
    .number()
    .min(0, 'Số khẩu phần phải lớn hơn hoặc bằng 0')
    .optional(),
  image: z.string().trim().optional(),
  isEaten: z.coerce.boolean().optional()
});

const scheduleMealSchema = z.object({
  mealType: z.enum(Object.values(MEAL_TYPE), 'Loại bữa ăn không hợp lệ'),
  notes: z.string().trim().optional(),
  dishes: z.preprocess(parseJSON, z.array(scheduleDishSchema)).optional()
});

const distanceTargetSchema = z.object({
  value: z.coerce.number().min(0.1, 'Quãng đường phải lớn hơn 0'),
  unit: z.enum(
    Object.values(WORKOUT_DISTANCE_UNIT),
    'Đơn vị quãng đường không hợp lệ'
  )
});

const weightAndRepsTargetSchema = z.object({
  weight: z.coerce
    .number()
    .min(0, 'Mức tạ phải lớn hơn hoặc bằng 0')
    .optional(),
  reps: z.coerce.number().int().min(1, 'Số rep phải lớn hơn hoặc bằng 1'),
  sets: z.coerce
    .number()
    .int()
    .min(1, 'Số set phải lớn hơn hoặc bằng 1')
    .optional()
});

const durationTargetSchema = z.object({
  seconds: z.coerce
    .number()
    .int()
    .min(1, 'Thời gian phải lớn hơn hoặc bằng 1 giây')
});

const scheduleWorkoutExerciseSchema = z
  .object({
    exerciseId: z
      .string('ID bài tập không hợp lệ')
      .trim()
      .min(1, 'ID bài tập là bắt buộc'),
    logType: z
      .enum(Object.values(WORKOUT_COUNTER_TYPE), 'logType không hợp lệ')
      .optional(),
    distanceTarget: distanceTargetSchema.optional(),
    weightAndRepsTarget: weightAndRepsTargetSchema.optional(),
    durationTarget: durationTargetSchema.optional(),
    isCompleted: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
  })
  .superRefine((data, ctx) => {
    if (!data.logType) {
      return;
    }

    if (data.logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
      if (!data.distanceTarget) {
        ctx.addIssue({
          code: 'custom',
          path: ['distanceTarget'],
          message: 'Bài tập Distance cần distanceTarget'
        });
      }
      if (data.weightAndRepsTarget || data.durationTarget) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Bài tập Distance chỉ được dùng distanceTarget, không dùng weightAndRepsTarget hoặc durationTarget'
        });
      }
    }

    if (data.logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
      if (!data.weightAndRepsTarget) {
        ctx.addIssue({
          code: 'custom',
          path: ['weightAndRepsTarget'],
          message: 'Bài tập WeightAndReps cần weightAndRepsTarget'
        });
      }
      if (data.distanceTarget || data.durationTarget) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Bài tập WeightAndReps chỉ được dùng weightAndRepsTarget, không dùng distanceTarget hoặc durationTarget'
        });
      }
    }

    if (data.logType === WORKOUT_COUNTER_TYPE.DURATION) {
      if (!data.durationTarget) {
        ctx.addIssue({
          code: 'custom',
          path: ['durationTarget'],
          message: 'Bài tập Duration cần durationTarget'
        });
      }
      if (data.distanceTarget || data.weightAndRepsTarget) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Bài tập Duration chỉ được dùng durationTarget, không dùng distanceTarget hoặc weightAndRepsTarget'
        });
      }
    }
  });

export const createScheduleRequestSchema = z.object({
  date: z.coerce.date('Định dạng ngày không hợp lệ'),
  dayOfWeek: z.enum(Object.values(DAY_OF_WEEK), 'Ngày trong tuần không hợp lệ'),
  workout: z
    .preprocess(parseJSON, z.array(scheduleWorkoutExerciseSchema))
    .optional()
});

export type CreateScheduleRequest = z.infer<typeof createScheduleRequestSchema>;

export const updateScheduleRequestSchema = z.object({
  date: z.coerce.date('Định dạng ngày không hợp lệ').optional(),
  notes: z.coerce.string().optional(),
  dayOfWeek: z
    .enum(Object.values(DAY_OF_WEEK), 'Ngày trong tuần không hợp lệ')
    .optional(),
  meals: z.preprocess(parseJSON, z.array(scheduleMealSchema)).optional(),
  workout: z
    .preprocess(parseJSON, z.array(scheduleWorkoutExerciseSchema))
    .optional()
});

export type UpdateScheduleRequest = z.infer<typeof updateScheduleRequestSchema>;

export const addScheduleWorkoutExerciseRequestSchema =
  scheduleWorkoutExerciseSchema;

export type AddScheduleWorkoutExerciseRequest = z.infer<
  typeof addScheduleWorkoutExerciseRequestSchema
>;

export const updateScheduleWorkoutExerciseRequestSchema = z.object({
  logType: z
    .enum(Object.values(WORKOUT_COUNTER_TYPE), 'logType không hợp lệ')
    .optional(),
  distanceTarget: distanceTargetSchema.optional(),
  weightAndRepsTarget: weightAndRepsTargetSchema.optional(),
  durationTarget: durationTargetSchema.optional(),
  isCompleted: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type UpdateScheduleWorkoutExerciseRequest = z.infer<
  typeof updateScheduleWorkoutExerciseRequestSchema
>;

const scheduleMealUpdateSchema = z.object({
  mealType: z.enum(Object.values(MEAL_TYPE), 'Loại bữa ăn không hợp lệ'),
  notes: z.string().trim().optional(),
  dishes: z
    .preprocess(
      parseJSON,
      z.array(
        z.object({
          dishId: z.string('ID món ăn là bắt buộc').trim(),
          servings: z.coerce
            .number()
            .min(0, 'Số khẩu phần phải lớn hơn hoặc bằng 0')
            .optional(),
          isEaten: z.coerce.boolean().optional()
        })
      )
    )
    .optional()
});

export const updateScheduleMealsRequestSchema = z.object({
  meals: z.preprocess(parseJSON, z.array(scheduleMealUpdateSchema))
});

export type UpdateScheduleMealsRequest = z.infer<
  typeof updateScheduleMealsRequestSchema
>;

export const updateScheduleDishStatusRequestSchema = z.object({
  isEaten: z.preprocess(parseBoolean, z.coerce.boolean())
});

export type UpdateScheduleDishStatusRequest = z.infer<
  typeof updateScheduleDishStatusRequestSchema
>;
