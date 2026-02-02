import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  hasOnboarded: boolean;
}

export interface LoginWithProviderResponse {
  accessToken: string;
  refreshToken: string;
  hasOnboarded: boolean;
}

export const signUpRequestSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  avatar: z.file().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  hasOnboarded: boolean;
}

export const forgotPasswordRequestSchema = z.object({
  email: z.email('Invalid email address')
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long')
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
