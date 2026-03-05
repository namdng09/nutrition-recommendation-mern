export const PAYMENT_STATUS = {
  PENDING: 'Đang chờ xử lý',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã huỷ'
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
