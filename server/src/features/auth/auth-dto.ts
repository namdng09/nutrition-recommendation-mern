import { z } from 'zod';

import { GENDER } from '~/shared/constants/gender';

export const loginRequestSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginWithProviderResponse {
  accessToken: string;
  refreshToken: string;
}

export const signUpRequestSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  avatar: z.file().optional(),
  gender: z
    .enum(Object.values(GENDER), { message: 'Invalid gender' })
    .optional(),
  dob: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
}

export const forgotPasswordRequestSchema = z.object({
  email: z.email('Invalid email address')
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long')
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
