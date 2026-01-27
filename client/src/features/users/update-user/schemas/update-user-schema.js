import * as yup from 'yup';

import { GENDER_OPTIONS } from '~/constants/gender';
import { ROLE_OPTIONS } from '~/constants/role';

export const updateUserSchema = yup.object({
  email: yup.string().email('Invalid email address').optional(),
  name: yup.string().min(2, 'Name must be at least 2 characters').optional(),
  gender: yup
    .string()
    .oneOf(
      GENDER_OPTIONS.map(option => option.value),
      'Invalid gender'
    )
    .optional(),
  role: yup
    .string()
    .oneOf(
      ROLE_OPTIONS.map(option => option.value),
      'Invalid role'
    )
    .optional(),
  dob: yup.string().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional(),
  avatar: yup.mixed().optional()
});
