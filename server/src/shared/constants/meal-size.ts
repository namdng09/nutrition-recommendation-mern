export const MEAL_SIZE = {
  TINY: 'Nhỏ',
  SMALL: 'Vừa',
  NORMAL: 'Bình thường',
  BIG: 'Lớn',
  HUGE: 'Rất lớn'
} as const;

export type MealSize = (typeof MEAL_SIZE)[keyof typeof MEAL_SIZE];
