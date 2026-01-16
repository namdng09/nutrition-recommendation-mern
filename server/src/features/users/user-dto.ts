import { z } from 'zod';

import { GENDER } from '~/shared/constants/gender';
import { ROLE } from '~/shared/constants/role';

export const createUserRequestSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  gender: z.enum(Object.values(GENDER), { message: 'Invalid gender' }),
  role: z.enum(Object.values(ROLE), { message: 'Invalid role' }),
  dob: z.string().optional()
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateProfileRequestSchema = z.object({
  email: z.email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatar: z.file().optional(),
  gender: z
    .enum(Object.values(GENDER), { message: 'Invalid gender' })
    .optional(),
  dob: z.string().optional()
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const updateUserRequestSchema = z.object({
  email: z.email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  avatar: z.file().optional(),
  gender: z
    .enum(Object.values(GENDER), { message: 'Invalid gender' })
    .optional(),
  role: z.enum(Object.values(ROLE), { message: 'Invalid role' }).optional(),
  dob: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional()
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
