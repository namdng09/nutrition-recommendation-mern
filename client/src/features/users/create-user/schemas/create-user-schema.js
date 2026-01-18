import * as yup from 'yup';

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
