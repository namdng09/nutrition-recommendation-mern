import { z } from 'zod';

import { POST_CATEGORY } from '~/shared/constants/post-category';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

export const createPostRequestSchema = z.object({
  title: z
    .string('Tiêu đề không hợp lệ')
    .trim()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  content: z
    .string('Nội dung không hợp lệ')
    .trim()
    .min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  category: z.enum(Object.values(POST_CATEGORY)).optional(),
  images: z.array(z.file()).optional(),
  isPublished: booleanSchema.optional()
});

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;

export const updatePostRequestSchema = createPostRequestSchema.partial();

export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;

export const createCommentRequestSchema = z.object({
  content: z
    .string('Nội dung bình luận không hợp lệ')
    .trim()
    .min(1, 'Nội dung bình luận phải có ít nhất 1 ký tự')
});

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;
