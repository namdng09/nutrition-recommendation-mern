import * as yup from 'yup';

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
