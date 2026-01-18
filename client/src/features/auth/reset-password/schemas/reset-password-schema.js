import * as yup from 'yup';

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .min(6, 'Confirm Password must be at least 6 characters long')
    .oneOf([yup.ref('password')], "Passwords don't match")
    .required('Confirm Password is required')
});
