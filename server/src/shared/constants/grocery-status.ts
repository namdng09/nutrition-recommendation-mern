export const GROCERY_STATUS = {
  ACTIVE: 'Đang hoạt động',
  COMPLETED: 'Đã hoàn thành',
  ARCHIVED: 'Đã lưu trữ'
} as const;

export type GroceryStatus =
  (typeof GROCERY_STATUS)[keyof typeof GROCERY_STATUS];
