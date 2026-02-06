import { z } from 'zod';

import { POST_CATEGORY } from '~/shared/constants/post-category';

const parseJSON = (val: any) => {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
};

export const createPostRequestSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  content: z.string().trim().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  category: z.enum(Object.values(POST_CATEGORY)).optional(),
  images: z.array(z.file()).optional(),
  isPublished: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;

export const updatePostRequestSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').optional(),
  content: z
    .string()
    .trim()
    .min(10, 'Nội dung phải có ít nhất 10 ký tự')
    .optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  category: z.enum(Object.values(POST_CATEGORY)).optional(),
  images: z.array(z.file()).optional(),
  isPublished: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;

export const createCommentRequestSchema = z.object({
  content: z.string().trim().min(1, 'Nội dung bình luận không được để trống')
});

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;
