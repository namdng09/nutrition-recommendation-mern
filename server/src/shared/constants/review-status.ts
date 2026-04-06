export const REVIEW_STATUS = {
  DRAFT: 'Nháp',
  PENDING: 'Đang chờ duyệt',
  UNDER_REVIEW: 'Đang được xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối'
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
