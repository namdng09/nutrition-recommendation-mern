export const MEAL_SIZE = {
  TINY: 'TINY',
  SMALL: 'SMALL',
  NORMAL: 'NORMAL',
  BIG: 'BIG',
  HUGE: 'HUGE'
} as const;

export type MealSize = (typeof MEAL_SIZE)[keyof typeof MEAL_SIZE];
