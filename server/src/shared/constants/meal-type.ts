export const MEAL_TYPE = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Đồ ăn vặt'
} as const;

export type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];
