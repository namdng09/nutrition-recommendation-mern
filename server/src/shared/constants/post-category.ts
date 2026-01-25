export const POST_CATEGORY = {
  RECIPE: 'recipe',
  NUTRITION: 'nutrition',
  LIFESTYLE: 'lifestyle',
  TIPS: 'tips'
} as const;

export type PostCategory = (typeof POST_CATEGORY)[keyof typeof POST_CATEGORY];
