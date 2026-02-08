import { ChefHat, Drumstick, Leaf, Pizza, Salad, Wheat } from 'lucide-react';

import { ALLERGEN } from './allergen';

export const DIET = Object.freeze({
  ANYTHING: 'Ăn uống tự do',
  KETO: 'Keto',
  MEDITERRANEAN: 'Địa Trung Hải',
  PALEO: 'Paleo',
  VEGAN: 'Thuần chay',
  VEGETARIAN: 'Ăn chay'
});

export const DIET_OPTIONS = [
  {
    value: DIET.ANYTHING,
    label: 'Ăn uống tự do',
    icon: Pizza,
    description: 'Không kiêng gì',
    excludedAllergens: []
  },
  {
    value: DIET.KETO,
    label: 'Keto',
    icon: Wheat,
    description: 'Kiêng: Ngũ cốc nhiều carb, Tinh bột, Đường',
    excludedAllergens: [
      ALLERGEN.WHEAT,
      ALLERGEN.BARLEY,
      ALLERGEN.RYE,
      ALLERGEN.CORN,
      ALLERGEN.GLUTEN
    ]
  },
  {
    value: DIET.MEDITERRANEAN,
    label: 'Địa Trung Hải',
    icon: Salad,
    description:
      'Kiêng: Thịt đỏ, Nước ép đóng hộp, Thịt chế biến, Tinh bột, Đường',
    excludedAllergens: []
  },
  {
    value: DIET.PALEO,
    label: 'Paleo',
    icon: Drumstick,
    description: 'Kiêng: Sữa, Ngũ cốc, Đậu, Tinh bột, Đậu nành, Đường',
    excludedAllergens: [
      ALLERGEN.MILK,
      ALLERGEN.LACTOSE,
      ALLERGEN.WHEAT,
      ALLERGEN.GLUTEN,
      ALLERGEN.BARLEY,
      ALLERGEN.RYE,
      ALLERGEN.CORN,
      ALLERGEN.SOYBEANS,
      ALLERGEN.PEANUTS,
      ALLERGEN.LUPIN
    ]
  },
  {
    value: DIET.VEGAN,
    label: 'Thuần chay',
    icon: Leaf,
    description:
      'Kiêng: Thịt đỏ, Gia cầm, Cá, Hải sản, Sữa, Trứng, Sốt mayonnaise, Mật ong',
    excludedAllergens: [
      ALLERGEN.MILK,
      ALLERGEN.EGGS,
      ALLERGEN.FISH,
      ALLERGEN.SHELLFISH,
      ALLERGEN.SHRIMP,
      ALLERGEN.CRAB,
      ALLERGEN.LOBSTER,
      ALLERGEN.SQUID,
      ALLERGEN.OYSTER,
      ALLERGEN.CLAM,
      ALLERGEN.MOLLUSCS,
      ALLERGEN.LACTOSE
    ]
  },
  {
    value: DIET.VEGETARIAN,
    label: 'Ăn chay',
    icon: ChefHat,
    description: 'Kiêng: Thịt đỏ, Gia cầm, Cá, Hải sản',
    excludedAllergens: [
      ALLERGEN.FISH,
      ALLERGEN.SHELLFISH,
      ALLERGEN.SHRIMP,
      ALLERGEN.CRAB,
      ALLERGEN.LOBSTER,
      ALLERGEN.SQUID,
      ALLERGEN.OYSTER,
      ALLERGEN.CLAM,
      ALLERGEN.MOLLUSCS
    ]
  }
];
