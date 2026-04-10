export const REVIEW_STATUS = {
  PENDING: 'Đang chờ đánh giá',
  EVALUATED: 'Đã được đánh giá'
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
