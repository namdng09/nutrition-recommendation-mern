export const INGREDIENT_CATEGORY = {
  VEGETABLES: 'Rau củ',
  FRUITS: 'Trái cây',
  GRAINS: 'Ngũ cốc',
  MEAT: 'Thịt',
  POULTRY: 'Gia cầm',
  SEAFOOD: 'Hải sản',
  DAIRY: 'Sản phẩm từ sữa',
  EGGS: 'Trứng',
  LEGUMES: 'Đậu & họ đậu',
  NUTS_SEEDS: 'Hạt & hạt giống',
  OILS_FATS: 'Dầu & chất béo',
  HERBS_SPICES: 'Rau thơm & gia vị',
  CONDIMENTS: 'Gia vị & nước chấm',
  SWEETENERS: 'Chất tạo ngọt',
  BEVERAGES: 'Đồ uống',
  BAKING: 'Nguyên liệu làm bánh',
  PASTA_NOODLES: 'Mì & sợi',
  BREAD: 'Bánh mì',
  SNACKS: 'Đồ ăn vặt',
  FROZEN: 'Thực phẩm đông lạnh',
  CANNED: 'Thực phẩm đóng hộp',
  SUPPLEMENTS: 'Thực phẩm bổ sung',
  OTHER: 'Khác'
} as const;

export type IngredientCategory =
  (typeof INGREDIENT_CATEGORY)[keyof typeof INGREDIENT_CATEGORY];
