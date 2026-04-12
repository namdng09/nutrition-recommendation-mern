import { z } from 'zod';

export const submitReviewRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn không được để trống')
});

export type SubmitReviewRequest = z.infer<typeof submitReviewRequestSchema>;

export const evaluateReviewRequestSchema = z.object({
  rating: z
    .number('Điểm đánh giá không hợp lệ')
    .min(1, 'Điểm đánh giá tối thiểu là 1')
    .max(5, 'Điểm đánh giá tối đa là 5'),
  feedback: z
    .string('Nội dung phản hồi không hợp lệ')
    .trim()
    .min(2, 'Nội dung phản hồi phải có ít nhất 2 ký tự')
});

export type EvaluateReviewRequest = z.infer<typeof evaluateReviewRequestSchema>;
