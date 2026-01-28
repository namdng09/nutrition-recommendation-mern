export const NUTRITION_VITAMIN = {
  VITAMIN_A: 'Vitamin A',
  VITAMIN_A_IU: 'Vitamin A IU',
  VITAMIN_B6: 'Vitamin B6',
  VITAMIN_B12: 'Vitamin B12',
  VITAMIN_C: 'Vitamin C',
  VITAMIN_D_IU: 'Vitamin D IU',
  VITAMIN_D2: 'Vitamin D2',
  VITAMIN_D3: 'Vitamin D3',
  VITAMIN_E: 'Vitamin E',
  VITAMIN_K: 'Vitamin K'
} as const;

export type Vitamin =
  (typeof NUTRITION_VITAMIN)[keyof typeof NUTRITION_VITAMIN];
