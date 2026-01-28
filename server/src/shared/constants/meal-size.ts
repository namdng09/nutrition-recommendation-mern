export const MEAL_SIZE = {
  TINY: 'Rất nhỏ',
  SMALL: 'Nhỏ',
  NORMAL: 'Bình thường',
  BIG: 'Lớn',
  HUGE: 'Rất lớn'
} as const;

export type MealSize = (typeof MEAL_SIZE)[keyof typeof MEAL_SIZE];
