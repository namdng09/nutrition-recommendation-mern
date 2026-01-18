import * as yup from 'yup';

import { GENDER } from '~/constants/gender';

export const signUpSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  name: yup.string().min(1, 'Name is required').required('Name is required'),
  gender: yup
    .string()
    .oneOf([...Object.values(GENDER), ''], 'Invalid gender')
    .optional(),
  dob: yup.string().optional(),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .min(6, 'Confirm Password must be at least 6 characters long')
    .oneOf([yup.ref('password')], "Passwords don't match")
    .required('Confirm Password is required'),
  avatar: yup
    .mixed()
    .test('fileSize', 'File size too large (max 5MB)', value => {
      if (!value || !value[0]) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', value => {
      if (!value || !value[0]) return true;
      return value[0].type.startsWith('image/');
    })
});
