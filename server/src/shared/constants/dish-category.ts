export const DISH_CATEGORY = {
  APPETIZER: 'Khai vị',
  MAIN_COURSE: 'Món chính',
  SIDE_DISH: 'Món phụ',
  DESSERT: 'Tráng miệng',
  SOUP: 'Súp',
  SALAD: 'Salad',
  BEVERAGE: 'Đồ uống',
  BREAKFAST: 'Bữa sáng',
  SNACK: 'Đồ ăn vặt',
  SAUCE: 'Nước sốt'
} as const;

export type DishCategory = (typeof DISH_CATEGORY)[keyof typeof DISH_CATEGORY];
