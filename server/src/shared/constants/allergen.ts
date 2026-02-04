export const ALLERGEN = {
  // Common Food Allergens (FDA Top 9)
  MILK: 'Sữa',
  EGGS: 'Trứng',
  FISH: 'Cá',
  SHELLFISH: 'Hải sản có vỏ',
  TREE_NUTS: 'Hạt cây',
  PEANUTS: 'Đậu phộng',
  WHEAT: 'Lúa mì',
  SOYBEANS: 'Đậu nành',
  SESAME: 'Mè',

  // EU Allergens
  MUSTARD: 'Mù tạt',
  CELERY: 'Cần tây',
  LUPIN: 'Đậu lupin',
  MOLLUSCS: 'Động vật thân mềm',
  SULFITES: 'Sulfite',

  // Gluten-related
  GLUTEN: 'Gluten',
  BARLEY: 'Lúa mạch',
  RYE: 'Lúa mạch đen',

  // Specific Shellfish & Seafood
  SHRIMP: 'Tôm',
  CRAB: 'Cua',
  LOBSTER: 'Tôm hùm',
  SQUID: 'Mực',
  OYSTER: 'Hàu',
  CLAM: 'Nghêu',

  // Specific Tree Nuts
  ALMOND: 'Hạnh nhân',
  CASHEW: 'Hạt điều',
  WALNUT: 'Óc chó',
  PECAN: 'Hạt pecan',
  PISTACHIO: 'Hạt dẻ cười',
  HAZELNUT: 'Hạt phỉ',
  MACADAMIA: 'Hạt macadamia',
  BRAZIL_NUT: 'Hạt brazil',

  // Fruits
  KIWI: 'Kiwi',
  BANANA: 'Chuối',
  AVOCADO: 'Bơ',
  STRAWBERRY: 'Dâu tây',
  PEACH: 'Đào',
  MANGO: 'Xoài',

  // Other Common Allergens
  LACTOSE: 'Lactose',
  CORN: 'Ngô',
  COCONUT: 'Dừa',
  GARLIC: 'Tỏi',
  ONION: 'Hành',
  TOMATO: 'Cà chua',
  CHOCOLATE: 'Sô-cô-la',
  COFFEE: 'Cà phê'
} as const;

export type Allergen = (typeof ALLERGEN)[keyof typeof ALLERGEN];
