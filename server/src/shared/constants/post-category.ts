export const POST_CATEGORY = {
  RECIPE: 'Công thức',
  NUTRITION: 'Dinh dưỡng',
  LIFESTYLE: 'Lối sống',
  TIPS: 'Mẹo'
} as const;

export type PostCategory = (typeof POST_CATEGORY)[keyof typeof POST_CATEGORY];
