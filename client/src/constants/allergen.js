export const ALLERGEN = Object.freeze({
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
});

export const ALLERGEN_OPTIONS = [
  // FDA Top 9
  { value: ALLERGEN.MILK, label: 'Sữa', category: 'FDA Top 9' },
  { value: ALLERGEN.EGGS, label: 'Trứng', category: 'FDA Top 9' },
  { value: ALLERGEN.FISH, label: 'Cá', category: 'FDA Top 9' },
  { value: ALLERGEN.SHELLFISH, label: 'Hải sản có vỏ', category: 'FDA Top 9' },
  { value: ALLERGEN.TREE_NUTS, label: 'Các loại hạt', category: 'FDA Top 9' },
  { value: ALLERGEN.PEANUTS, label: 'Đậu phộng', category: 'FDA Top 9' },
  { value: ALLERGEN.WHEAT, label: 'Lúa mì', category: 'FDA Top 9' },
  { value: ALLERGEN.SOYBEANS, label: 'Đậu nành', category: 'FDA Top 9' },
  { value: ALLERGEN.SESAME, label: 'Vừng', category: 'FDA Top 9' },

  // EU Allergens
  { value: ALLERGEN.MUSTARD, label: 'Mù tạt', category: 'EU Allergens' },
  { value: ALLERGEN.CELERY, label: 'Cần tây', category: 'EU Allergens' },
  { value: ALLERGEN.LUPIN, label: 'Đậu lupin', category: 'EU Allergens' },
  { value: ALLERGEN.MOLLUSCS, label: 'Nhuyễn thể', category: 'EU Allergens' },
  { value: ALLERGEN.SULFITES, label: 'Sulfites', category: 'EU Allergens' },

  // Gluten-related
  { value: ALLERGEN.GLUTEN, label: 'Gluten', category: 'Gluten' },
  { value: ALLERGEN.BARLEY, label: 'Lúa mạch', category: 'Gluten' },
  { value: ALLERGEN.RYE, label: 'Lúa mạch đen', category: 'Gluten' },

  // Specific Shellfish & Seafood
  { value: ALLERGEN.SHRIMP, label: 'Tôm', category: 'Hải sản' },
  { value: ALLERGEN.CRAB, label: 'Cua', category: 'Hải sản' },
  { value: ALLERGEN.LOBSTER, label: 'Tôm hùm', category: 'Hải sản' },
  { value: ALLERGEN.SQUID, label: 'Mực', category: 'Hải sản' },
  { value: ALLERGEN.OYSTER, label: 'Hàu', category: 'Hải sản' },
  { value: ALLERGEN.CLAM, label: 'Nghêu', category: 'Hải sản' },

  // Specific Tree Nuts
  { value: ALLERGEN.ALMOND, label: 'Hạnh nhân', category: 'Các loại hạt' },
  { value: ALLERGEN.CASHEW, label: 'Hạt điều', category: 'Các loại hạt' },
  { value: ALLERGEN.WALNUT, label: 'Quả óc chó', category: 'Các loại hạt' },
  { value: ALLERGEN.PECAN, label: 'Hạt pecan', category: 'Các loại hạt' },
  {
    value: ALLERGEN.PISTACHIO,
    label: 'Hạt dẻ cười',
    category: 'Các loại hạt'
  },
  { value: ALLERGEN.HAZELNUT, label: 'Hạt phỉ', category: 'Các loại hạt' },
  { value: ALLERGEN.MACADAMIA, label: 'Hạt mắc ca', category: 'Các loại hạt' },
  { value: ALLERGEN.BRAZIL_NUT, label: 'Hạt Brazil', category: 'Các loại hạt' },

  // Fruits
  { value: ALLERGEN.KIWI, label: 'Kiwi', category: 'Trái cây' },
  { value: ALLERGEN.BANANA, label: 'Chuối', category: 'Trái cây' },
  { value: ALLERGEN.AVOCADO, label: 'Bơ', category: 'Trái cây' },
  { value: ALLERGEN.STRAWBERRY, label: 'Dâu tây', category: 'Trái cây' },
  { value: ALLERGEN.PEACH, label: 'Đào', category: 'Trái cây' },
  { value: ALLERGEN.MANGO, label: 'Xoài', category: 'Trái cây' },

  // Other Common Allergens
  { value: ALLERGEN.LACTOSE, label: 'Lactose', category: 'Khác' },
  { value: ALLERGEN.CORN, label: 'Ngô', category: 'Khác' },
  { value: ALLERGEN.COCONUT, label: 'Dừa', category: 'Khác' },
  { value: ALLERGEN.GARLIC, label: 'Tỏi', category: 'Khác' },
  { value: ALLERGEN.ONION, label: 'Hành', category: 'Khác' },
  { value: ALLERGEN.TOMATO, label: 'Cà chua', category: 'Khác' },
  { value: ALLERGEN.CHOCOLATE, label: 'Sô cô la', category: 'Khác' },
  { value: ALLERGEN.COFFEE, label: 'Cà phê', category: 'Khác' }
];

// Grouped allergens for multi-select component
export const ALLERGEN_GROUPS = [
  {
    category: 'Dị ứng phổ biến (FDA Top 9)',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [
        ALLERGEN.MILK,
        ALLERGEN.EGGS,
        ALLERGEN.FISH,
        ALLERGEN.SHELLFISH,
        ALLERGEN.TREE_NUTS,
        ALLERGEN.PEANUTS,
        ALLERGEN.WHEAT,
        ALLERGEN.SOYBEANS,
        ALLERGEN.SESAME
      ].includes(opt.value)
    )
  },
  {
    category: 'Ngũ cốc có Gluten',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [ALLERGEN.GLUTEN, ALLERGEN.WHEAT, ALLERGEN.BARLEY, ALLERGEN.RYE].includes(
        opt.value
      )
    )
  },
  {
    category: 'Hải sản',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [
        ALLERGEN.FISH,
        ALLERGEN.SHELLFISH,
        ALLERGEN.SHRIMP,
        ALLERGEN.CRAB,
        ALLERGEN.LOBSTER,
        ALLERGEN.SQUID,
        ALLERGEN.OYSTER,
        ALLERGEN.CLAM,
        ALLERGEN.MOLLUSCS
      ].includes(opt.value)
    )
  },
  {
    category: 'Các loại hạt',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [
        ALLERGEN.TREE_NUTS,
        ALLERGEN.PEANUTS,
        ALLERGEN.ALMOND,
        ALLERGEN.CASHEW,
        ALLERGEN.WALNUT,
        ALLERGEN.PECAN,
        ALLERGEN.PISTACHIO,
        ALLERGEN.HAZELNUT,
        ALLERGEN.MACADAMIA,
        ALLERGEN.BRAZIL_NUT
      ].includes(opt.value)
    )
  },
  {
    category: 'Trái cây',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [
        ALLERGEN.KIWI,
        ALLERGEN.BANANA,
        ALLERGEN.AVOCADO,
        ALLERGEN.STRAWBERRY,
        ALLERGEN.PEACH,
        ALLERGEN.MANGO
      ].includes(opt.value)
    )
  },
  {
    category: 'Khác',
    options: ALLERGEN_OPTIONS.filter(opt =>
      [
        ALLERGEN.MUSTARD,
        ALLERGEN.CELERY,
        ALLERGEN.LUPIN,
        ALLERGEN.SULFITES,
        ALLERGEN.LACTOSE,
        ALLERGEN.CORN,
        ALLERGEN.COCONUT,
        ALLERGEN.GARLIC,
        ALLERGEN.ONION,
        ALLERGEN.TOMATO,
        ALLERGEN.CHOCOLATE,
        ALLERGEN.COFFEE
      ].includes(opt.value)
    )
  }
];
