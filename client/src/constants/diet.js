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
  {
    value: DIET.ANYTHING,
    label: 'Ăn uống tự do',
    icon: Pizza,
    description: 'Không loại trừ gì cả'
  },
  {
    value: DIET.KETO,
    label: 'Keto',
    icon: Wheat,
    description: 'Loại trừ: Ngũ cốc nhiều carb, Tinh bột, Đường'
  },
  {
    value: DIET.MEDITERRANEAN,
    label: 'Địa Trung Hải',
    icon: Salad,
    description:
      'Loại trừ: Thịt đỏ, Nước ép đóng hộp, Thịt chế biến, Tinh bột, Đường'
  },
  {
    value: DIET.PALEO,
    label: 'Paleo',
    icon: Drumstick,
    description: 'Loại trừ: Sữa, Ngũ cốc, Đậu, Tinh bột, Đậu nành, Đường'
  },
  {
    value: DIET.VEGAN,
    label: 'Thuần chay',
    icon: Leaf,
    description:
      'Loại trừ: Thịt đỏ, Gia cầm, Cá, Hải sản, Sữa, Trứng, Sốt mayonnaise, Mật ong'
  },
  {
    value: DIET.VEGETARIAN,
    label: 'Ăn chay',
    icon: ChefHat,
    description: 'Loại trừ: Thịt đỏ, Gia cầm, Cá, Hải sản'
  }
];
