import { z } from 'zod';

import { ROLE } from '~/shared/constants/role';

export const loginRequestSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
    )
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

export const signUpRequestSchema = z
  .object({
    email: z.email('Email không hợp lệ'),
    name: z.string('Tên là bắt buộc').min(2, 'Tên phải có ít nhất 2 ký tự'),
    avatar: z.file().optional(),
    password: z
      .string('Mật khẩu là bắt buộc')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      ),
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
  })
  .superRefine((data, ctx) => {
    if (data.role !== ROLE.NUTRITIONIST) {
      return;
    }

    if (!data.certificateName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['certificateName'],
        message: 'Tên chứng chỉ là bắt buộc với chuyên gia dinh dưỡng'
      });
    }

    if (!data.certificate) {
      ctx.addIssue({
        code: 'custom',
        path: ['certificate'],
        message: 'Chứng chỉ là bắt buộc với chuyên gia dinh dưỡng'
      });
    }

    if (!data.workplace?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['workplace'],
        message: 'Nơi làm việc là bắt buộc với chuyên gia dinh dưỡng'
      });
    }

    if (!data.graduatedUniversity?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['graduatedUniversity'],
        message: 'Trường tốt nghiệp là bắt buộc với chuyên gia dinh dưỡng'
      });
    }
  });

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export type ValidatedNutritionistSignUpRequest = SignUpRequest & {
  role: typeof ROLE.NUTRITIONIST;
  certificateName: string;
  workplace: string;
  graduatedUniversity: string;
  professionalBio?: string;
};

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
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
    )
});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// Query-param schema — the signed JWT is delivered via ?token=<value>
export const resetPasswordQuerySchema = z.object({
  token: z.string().min(1, 'Reset token is required')
});
export type ResetPasswordQuery = z.infer<typeof resetPasswordQuerySchema>;
