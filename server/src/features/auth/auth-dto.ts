import { z } from 'zod';

import { ROLE } from '~/shared/constants/role';

export const loginRequestSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
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
  email: z.email('Email không hợp lệ'),
  name: z.string('Tên là bắt buộc').min(2, 'Tên phải có ít nhất 2 ký tự'),
  avatar: z.file().optional(),
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z
    .enum([ROLE.USER, ROLE.NUTRITIONIST], {
      error: 'Vai trò không hợp lệ'
    })
    .optional()
    .default(ROLE.USER),
  certificateName: z.string().optional(),
  certificate: z.file().optional(),
  workplace: z.string().optional(),
  graduatedUniversity: z.string().optional(),
  professionalBio: z.string().optional()
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  hasOnboarded: boolean;
}

export const forgotPasswordRequestSchema = z.object({
  email: z.email('Email không hợp lệ')
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// Query-param schema — the signed JWT is delivered via ?token=<value>
export const resetPasswordQuerySchema = z.object({
  token: z.string().min(1, 'Reset token is required')
});
export type ResetPasswordQuery = z.infer<typeof resetPasswordQuerySchema>;
