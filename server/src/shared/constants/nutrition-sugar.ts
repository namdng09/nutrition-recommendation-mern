export const NUTRITION_SUGAR = {
  SUGAR: 'Sugar',
  SUCROSE: 'Sucrose',
  GLUCOSE: 'Glucose',
  FRUCTOSE: 'Fructose',
  LACTOSE: 'Lactose',
  MALTOSE: 'Maltose',
  GALACTOSE: 'Galactose',
  STARCH: 'Starch'
} as const;

export type NutritionSugar =
  (typeof NUTRITION_SUGAR)[keyof typeof NUTRITION_SUGAR];
