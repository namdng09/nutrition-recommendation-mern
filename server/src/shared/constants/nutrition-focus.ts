export const NUTRITION_FOCUS = {
  HIGH_PROTEIN: 'Giàu đạm',
  LOW_CARB: 'Ít tinh bột',
  LOW_FAT: 'Ít béo',
  HIGH_FIBER: 'Giàu chất xơ',
  LOW_SODIUM: 'Ít muối'
} as const;

export type NutritionFocus =
  (typeof NUTRITION_FOCUS)[keyof typeof NUTRITION_FOCUS];
