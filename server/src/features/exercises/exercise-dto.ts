import { z } from 'zod';

import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const exerciseBodyPartSchema = z.object({
  name: z
    .string('Tên nhóm cơ/dụng cụ không hợp lệ')
    .trim()
    .min(1, 'Tên nhóm cơ/dụng cụ không được để trống'),
  image: z.string().trim().optional()
});

export const createExerciseRequestSchema = z.object({
  name: z
    .string('Tên bài tập không hợp lệ')
    .trim()
    .min(2, 'Tên bài tập phải có ít nhất 2 ký tự'),
  tutorial: z.string().trim().optional(),
  instructions: z
    .string('Hướng dẫn không hợp lệ')
    .trim()
    .min(1, 'Hướng dẫn không được để trống'),
  difficulty: z.enum(Object.values(EXERCISE_DIFFICULTY), 'Độ khó không hợp lệ'),
  type: z.enum(Object.values(EXERCISE_TYPE), 'Loại bài tập không hợp lệ'),
  logType: z.enum(Object.values(WORKOUT_COUNTER_TYPE), 'logType không hợp lệ'),
  muscles: z.preprocess(parseJSON, z.array(exerciseBodyPartSchema)).optional(),
  equipments: z
    .preprocess(parseJSON, z.array(exerciseBodyPartSchema))
    .optional(),
  isActive: booleanSchema.optional()
});

export type CreateExerciseRequest = z.infer<typeof createExerciseRequestSchema>;

export const updateExerciseRequestSchema =
  createExerciseRequestSchema.partial();

export type UpdateExerciseRequest = z.infer<typeof updateExerciseRequestSchema>;
