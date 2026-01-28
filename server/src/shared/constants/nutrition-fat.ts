export const NUTRITION_FAT = {
  SATURATED_FATS: 'Saturated fats',
  MONOUNSATURATED_FATS: 'Monounsaturated fats',
  POLYUNSATURATED_FATS: 'Polyunsaturated fats',
  TRANS_FATS: 'Trans fats'
} as const;

export type NutritionFat = (typeof NUTRITION_FAT)[keyof typeof NUTRITION_FAT];
