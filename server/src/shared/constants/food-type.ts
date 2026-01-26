export const MEAL_TYPE = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
  DESSERT: 'DESSERT',
  ALL: 'ALL'
} as const;

export type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];
