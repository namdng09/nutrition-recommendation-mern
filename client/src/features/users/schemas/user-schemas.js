import * as yup from 'yup';

import { GENDER } from '~/constants/gender';

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
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  role: yup
    .string()
    .oneOf(['user', 'admin'], 'Invalid role')
    .required('Role is required'),
  dob: yup.string().optional()
});

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .optional(),
  gender: yup
    .string()
    .oneOf([...Object.values(GENDER), ''], 'Invalid gender')
    .optional(),
  dob: yup.string().optional(),
  avatar: yup
    .mixed()
    .test('fileSize', 'File size too large (max 5MB)', value => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', value => {
      if (!value) return true;
      return value.type.startsWith('image/');
    })
    .optional()
});

export const updateUserSchema = yup.object({
  email: yup.string().email('Invalid email address').optional(),
  name: yup.string().min(2, 'Name must be at least 2 characters').optional(),
  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .optional(),
  role: yup.string().oneOf(['user', 'admin'], 'Invalid role').optional(),
  dob: yup.string().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional(),
  avatar: yup.mixed().optional()
});
