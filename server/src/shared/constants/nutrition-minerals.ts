export const NUTRITION_MINERAL = {
  CALCI: 'Calci',
  SAT: 'Sắt',
  MAGIE: 'Magiê',
  MANGAN: 'Mangan',
  PHOSPHO: 'Phospho',
  KALI: 'Kali',
  NATRI: 'Natri',
  KEM: 'Kẽm',
  DONG: 'Đồng',
  SELEN: 'Selen'
} as const;

export type NutritionMineral =
  (typeof NUTRITION_MINERAL)[keyof typeof NUTRITION_MINERAL];
