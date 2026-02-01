import * as yup from 'yup';

import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { BODYFAT } from '~/constants/bodyfat';

export const updatePhysicalStatsSchema = yup.object({
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
    .oneOf(Object.values(BODYFAT), 'Mức độ mỡ cơ thể không hợp lệ')
    .required('Mức độ mỡ cơ thể là bắt buộc'),
  activityLevel: yup
    .string()
    .oneOf(Object.values(ACTIVITY_LEVEL), 'Mức độ hoạt động không hợp lệ')
    .required('Mức độ hoạt động là bắt buộc')
});
