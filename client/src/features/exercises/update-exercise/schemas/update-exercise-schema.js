import * as yup from 'yup';

import {
  EXERCISE_DIFFICULTY_OPTIONS,
  EXERCISE_EQUIPMENT_NAMES,
  EXERCISE_MUSCLE_NAMES,
  EXERCISE_TYPE_OPTIONS,
  WORKOUT_COUNTER_TYPE_OPTIONS
} from '~/constants/exercise';

export const updateExerciseSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Ten bai tap phai co it nhat 2 ky tu')
    .required('Ten bai tap la bat buoc'),
  instructions: yup.string().trim().required('Huong dan la bat buoc'),
  difficulty: yup
    .string()
    .oneOf(
      EXERCISE_DIFFICULTY_OPTIONS.map(opt => opt.value),
      'Do kho khong hop le'
    )
    .required('Do kho la bat buoc'),
  type: yup
    .string()
    .oneOf(
      EXERCISE_TYPE_OPTIONS.map(opt => opt.value),
      'Loai bai tap khong hop le'
    )
    .required('Loai bai tap la bat buoc'),
  logType: yup
    .string()
    .oneOf(
      WORKOUT_COUNTER_TYPE_OPTIONS.map(opt => opt.value),
      'Loai ghi nhan khong hop le'
    )
    .required('Loai ghi nhan la bat buoc'),
  muscles: yup.array().of(
    yup.object({
      name: yup
        .string()
        .oneOf(EXERCISE_MUSCLE_NAMES, 'Nhom co khong hop le')
        .required(),
      image: yup.string()
    })
  ),
  equipments: yup.array().of(
    yup.object({
      name: yup
        .string()
        .oneOf(EXERCISE_EQUIPMENT_NAMES, 'Dung cu khong hop le')
        .required(),
      image: yup.string()
    })
  ),
  isActive: yup.boolean()
});
