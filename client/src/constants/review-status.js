export const REVIEW_STATUS = Object.freeze({
  PENDING: 'Đang chờ đánh giá',
  EVALUATED: 'Đã được đánh giá'
});

export const REVIEW_STATUS_OPTIONS = [
  { value: REVIEW_STATUS.PENDING, label: REVIEW_STATUS.PENDING },
  { value: REVIEW_STATUS.EVALUATED, label: REVIEW_STATUS.EVALUATED }
];
