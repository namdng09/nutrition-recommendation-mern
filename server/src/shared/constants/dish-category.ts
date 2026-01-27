export const DISH_CATEGORY = {
  APPETIZER: 'appetizer',
  MAIN_COURSE: 'main_course',
  SIDE_DISH: 'side_dish',
  DESSERT: 'dessert',
  SOUP: 'soup',
  SALAD: 'salad',
  BEVERAGE: 'beverage',
  BREAKFAST: 'breakfast',
  SNACK: 'snack',
  SAUCE: 'sauce'
} as const;

export type DishCategory = (typeof DISH_CATEGORY)[keyof typeof DISH_CATEGORY];
