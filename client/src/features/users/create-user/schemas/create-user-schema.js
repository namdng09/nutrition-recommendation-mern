import * as yup from 'yup';

import { GENDER_OPTIONS } from '~/constants/gender';
import { ROLE_OPTIONS } from '~/constants/role';

export const createUserSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  gender: yup
    .string()
    .oneOf(
      GENDER_OPTIONS.map(option => option.value),
      'Invalid gender'
    )
    .required('Gender is required'),
  role: yup
    .string()
    .oneOf(
      ROLE_OPTIONS.map(option => option.value),
      'Invalid role'
    )
    .required('Role is required'),
  dob: yup.string().optional()
});
