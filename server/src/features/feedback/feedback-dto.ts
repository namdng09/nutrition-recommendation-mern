import { z } from 'zod';

import { FEEDBACK_TYPE } from '~/shared/constants/feedback-type';

export const createFeedbackRequestSchema = z.object({
  type: z.enum(Object.values(FEEDBACK_TYPE), 'Loại feedback không hợp lệ'),
  content: z
    .string('Nội dung feedback không hợp lệ')
    .trim()
    .min(2, 'Nội dung feedback phải có ít nhất 2 ký tự')
});

export type CreateFeedbackRequest = z.infer<typeof createFeedbackRequestSchema>;
