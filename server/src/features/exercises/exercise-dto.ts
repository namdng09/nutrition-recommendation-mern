import { z } from 'zod';

import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import {
  EXERCISE_EQUIPMENT_NAMES,
  type ExerciseEquipmentName
} from '~/shared/constants/exercise-equipments';
import {
  EXERCISE_MUSCLE_NAMES,
  type ExerciseMuscleName
} from '~/shared/constants/exercise-muscles';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { WORKOUT_COUNTER_TYPE } from '~/shared/constants/workout-counter-type';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const exerciseMuscleNameSchema = z.enum(
  EXERCISE_MUSCLE_NAMES as [ExerciseMuscleName, ...ExerciseMuscleName[]],
  'Tên nhóm cơ không hợp lệ'
);

const exerciseEquipmentNameSchema = z.enum(
  EXERCISE_EQUIPMENT_NAMES as [
    ExerciseEquipmentName,
    ...ExerciseEquipmentName[]
  ],
  'Tên dụng cụ không hợp lệ'
);

const exerciseMuscleSchema = z.object({
  name: exerciseMuscleNameSchema,
  image: z.string().trim().optional()
});

const exerciseEquipmentSchema = z.object({
  name: exerciseEquipmentNameSchema,
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
  muscles: z.preprocess(parseJSON, z.array(exerciseMuscleSchema)).optional(),
  equipments: z
    .preprocess(parseJSON, z.array(exerciseEquipmentSchema))
    .optional(),
  isActive: booleanSchema.optional()
});

export type CreateExerciseRequest = z.infer<typeof createExerciseRequestSchema>;

export const updateExerciseRequestSchema =
  createExerciseRequestSchema.partial();

export type UpdateExerciseRequest = z.infer<typeof updateExerciseRequestSchema>;
