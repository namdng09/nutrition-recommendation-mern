import { ChefHat, Drumstick, Leaf, Pizza, Salad, Wheat } from 'lucide-react';

export const DIET = Object.freeze({
  ANYTHING: 'Ăn uống tự do',
  KETO: 'Keto',
  MEDITERRANEAN: 'Địa Trung Hải',
  PALEO: 'Paleo',
  VEGAN: 'Thuần chay',
  VEGETARIAN: 'Ăn chay'
});

export const DIET_OPTIONS = [
  { value: DIET.ANYTHING, label: 'Ăn uống tự do', icon: Pizza },
  { value: DIET.KETO, label: 'Keto', icon: Wheat },
  { value: DIET.MEDITERRANEAN, label: 'Địa Trung Hải', icon: Salad },
  { value: DIET.PALEO, label: 'Paleo', icon: Drumstick },
  { value: DIET.VEGAN, label: 'Thuần chay', icon: Leaf },
  { value: DIET.VEGETARIAN, label: 'Ăn chay', icon: ChefHat }
];
