export const QUERY_KEYS = {
  PROFILE: ['profile'],
  USERS: ['users'],
  USER: id => ['user', id],
  INGREDIENTS: ['ingredients'],
  INGREDIENT: id => ['ingredient', id],
  COLLECTIONS: ['collections'],
  COLLECTION: id => ['collection', id],
  DISHES: ['dishes'],
  DISH: id => ['dish', id],
  SCHEDULES: ['schedules'],
  POSTS: ['posts'],
  POST: id => ['post', id],
  SCHEDULE: id => ['schedules', id],
  DISH_NUTRITION_DETAIL: id => ['dish_nutrition_detail', id]
};
