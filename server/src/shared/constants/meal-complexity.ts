export const MEAL_COMPLEXITY = {
  SUPER_SIMPLE: 'SUPER_SIMPLE',
  SIMPLE: 'SIMPLE',
  MODERATE: 'MODERATE',
  COMPLEX: 'COMPLEX'
} as const;

export type MealComplexity =
  (typeof MEAL_COMPLEXITY)[keyof typeof MEAL_COMPLEXITY];
