import * as yup from 'yup';

import {
  EXERCISE_DIFFICULTY,
  EXERCISE_EQUIPMENT_NAMES,
  EXERCISE_MUSCLE_NAMES,
  EXERCISE_TYPE,
  WORKOUT_COUNTER_TYPE
} from '~/constants/exercise';

const muscleSchema = yup.object({
  name: yup
    .string()
    .oneOf(EXERCISE_MUSCLE_NAMES, 'Tên nhóm cơ không hợp lệ')
    .required('Tên nhóm cơ là bắt buộc'),
  image: yup.string().trim().optional()
});

const equipmentSchema = yup.object({
  name: yup
    .string()
    .oneOf(EXERCISE_EQUIPMENT_NAMES, 'Tên dụng cụ không hợp lệ')
    .required('Tên dụng cụ là bắt buộc'),
  image: yup.string().trim().optional()
});

export const createExerciseSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Tên bài tập phải có ít nhất 2 ký tự')
    .required('Tên bài tập là bắt buộc'),
  instructions: yup
    .string()
    .trim()
    .min(1, 'Hướng dẫn không được để trống')
    .required('Hướng dẫn là bắt buộc'),
  difficulty: yup
    .string()
    .oneOf(Object.values(EXERCISE_DIFFICULTY), 'Độ khó không hợp lệ')
    .required('Độ khó là bắt buộc'),
  type: yup
    .string()
    .oneOf(Object.values(EXERCISE_TYPE), 'Loại bài tập không hợp lệ')
    .required('Loại bài tập là bắt buộc'),
  logType: yup
    .string()
    .oneOf(Object.values(WORKOUT_COUNTER_TYPE), 'Loại đếm không hợp lệ')
    .required('Loại đếm là bắt buộc'),
  muscles: yup
    .array()
    .of(muscleSchema)
    .min(1, 'Phải chọn ít nhất 1 nhóm cơ')
    .required('Nhóm cơ là bắt buộc'),
  equipments: yup
    .array()
    .of(equipmentSchema)
    .min(1, 'Phải chọn ít nhất 1 dụng cụ')
    .required('Dụng cụ là bắt buộc'),
  tutorial: yup.mixed().optional(),
  isActive: yup.boolean().optional().default(true)
});
