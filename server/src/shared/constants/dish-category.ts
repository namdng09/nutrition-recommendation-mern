export const DISH_CATEGORY = {
  APPETIZER: 'Khai vị',
  MAIN_COURSE: 'Món chính',
  SIDE_DISH: 'Món ăn kèm',
  DESSERT: 'Tráng miệng',
  SOUP: 'Súp',
  SALAD: 'Salad',
  BEVERAGE: 'Đồ uống',
  BREAKFAST: 'Bữa sáng',
  SNACK: 'Ăn nhẹ',
  SAUCE: 'Nước sốt'
} as const;

export type DishCategory = (typeof DISH_CATEGORY)[keyof typeof DISH_CATEGORY];
