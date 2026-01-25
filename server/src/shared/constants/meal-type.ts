export const MEAL_TYPE = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
} as const;

export type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];
