export const DIET = {
  ANYTHING: 'Ăn uống tự do',
  KETO: 'Keto',
  MEDITERRANEAN: 'Địa Trung Hải',
  PALEO: 'Paleo',
  VEGAN: 'Thuần chay',
  VEGETARIAN: 'Ăn chay'
} as const;

export type Diet = (typeof DIET)[keyof typeof DIET];
