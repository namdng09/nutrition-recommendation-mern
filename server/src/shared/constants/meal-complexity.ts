export const MEAL_COMPLEXITY = {
  SUPER_SIMPLE: 'Rất đơn giản',
  SIMPLE: 'Đơn giản',
  MODERATE: 'Trung bình',
  COMPLEX: 'Phức tạp'
} as const;

export type MealComplexity =
  (typeof MEAL_COMPLEXITY)[keyof typeof MEAL_COMPLEXITY];
