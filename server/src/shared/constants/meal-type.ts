export const MEAL_TYPE = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Ăn nhẹ',
  DESSERT: 'Tráng miệng',
  ALL: 'Tất cả'
} as const;

export type MealType = (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE];
