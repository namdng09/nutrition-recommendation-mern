export const FEEDBACK_TYPE = {
  SYSTEM: 'Hệ thống',
  CONTENT: 'Nội dung'
} as const;

export type FeedbackType = (typeof FEEDBACK_TYPE)[keyof typeof FEEDBACK_TYPE];
