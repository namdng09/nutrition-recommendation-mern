export const NUTRITION_VITAMIN = {
  VITAMIN_C: 'Vitamin C',
  VITAMIN_B1: 'Vitamin B1',
  VITAMIN_B2: 'Vitamin B2',
  VITAMIN_PP: 'Vitamin PP',
  VITAMIN_B5: 'Vitamin B5',
  VITAMIN_B6: 'Vitamin B6',
  FOLAT: 'Folat',
  VITAMIN_B9: 'Vitamin B9',
  VITAMIN_H: 'Vitamin H',
  VITAMIN_B12: 'Vitamin B12',
  VITAMIN_A: 'Vitamin A',
  VITAMIN_D: 'Vitamin D',
  VITAMIN_E: 'Vitamin E',
  VITAMIN_K: 'Vitamin K'
} as const;

export type Vitamin =
  (typeof NUTRITION_VITAMIN)[keyof typeof NUTRITION_VITAMIN];
