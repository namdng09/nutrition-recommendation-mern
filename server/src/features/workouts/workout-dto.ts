import { z } from 'zod';

import {
  WORKOUT_COUNTER_TYPE,
  WORKOUT_DISTANCE_UNIT
} from '~/shared/constants/workout-counter-type';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

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

const workoutExerciseSchema = z
  .object({
    exerciseId: z
      .string('ID bài tập không hợp lệ')
      .trim()
      .min(1, 'ID bài tập là bắt buộc'),
    counterType: z.enum(
      Object.values(WORKOUT_COUNTER_TYPE),
      'Kiểu bộ đếm không hợp lệ'
    ),
    distanceTarget: distanceTargetSchema.optional(),
    weightAndRepsTarget: weightAndRepsTargetSchema.optional(),
    durationTarget: durationTargetSchema.optional(),
    note: z.string().trim().optional(),
    order: z.coerce
      .number()
      .int()
      .min(1, 'Thứ tự phải lớn hơn hoặc bằng 1')
      .optional()
  })
  .superRefine((data, ctx) => {
    if (data.counterType === WORKOUT_COUNTER_TYPE.DISTANCE) {
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

    if (data.counterType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
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

    if (data.counterType === WORKOUT_COUNTER_TYPE.DURATION) {
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

export const createWorkoutRequestSchema = z.object({
  name: z
    .string('Tên workout không hợp lệ')
    .trim()
    .min(2, 'Tên workout phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  exercises: z.preprocess(
    parseJSON,
    z.array(workoutExerciseSchema).min(1, 'Workout phải có ít nhất một bài tập')
  ),
  isActive: booleanSchema.optional()
});

export type CreateWorkoutRequest = z.infer<typeof createWorkoutRequestSchema>;

export const updateWorkoutRequestSchema = createWorkoutRequestSchema.partial();

export type UpdateWorkoutRequest = z.infer<typeof updateWorkoutRequestSchema>;
