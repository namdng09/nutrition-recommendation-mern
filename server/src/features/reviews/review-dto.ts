import { z } from 'zod';

export const submitReviewRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn không được để trống')
});

export type SubmitReviewRequest = z.infer<typeof submitReviewRequestSchema>;

export const addCommentRequestSchema = z.object({
  content: z
    .string('Nội dung bình luận không hợp lệ')
    .trim()
    .min(2, 'Nội dung bình luận phải có ít nhất 2 ký tự')
});

export type AddCommentRequest = z.infer<typeof addCommentRequestSchema>;

export const rejectReviewRequestSchema = z.object({
  rejectionReason: z
    .string('Lý do từ chối không hợp lệ')
    .trim()
    .min(2, 'Lý do từ chối phải có ít nhất 2 ký tự')
});

export type RejectReviewRequest = z.infer<typeof rejectReviewRequestSchema>;
