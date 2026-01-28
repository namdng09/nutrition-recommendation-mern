export const NUTRITION_MINERAL = {
  ALPHA_CAROTENE: 'Alpha carotene',
  BETA_CAROTENE: 'Beta carotene',
  CAFFEINE: 'Caffeine',
  CHOLINE: 'Choline',
  COPPER: 'Copper',
  FLUORIDE: 'Fluoride',
  FOLATE_B9: 'Folate (B9)',
  LYCOPENE: 'Lycopene',
  MAGNESIUM: 'Magnesium',
  MANGANESE: 'Manganese',
  NIACIN: 'Niacin',
  PANTOTHENIC_ACID: 'Pantothenic acid',
  PHOSPHORUS: 'Phosphorus',
  RETINOL: 'Retinol',
  RIBOFLAVIN_B2: 'Riboflavin (B2)',
  SELENIUM: 'Selenium',
  THEOBROMINE: 'Theobromine',
  THIAMINE: 'Thiamine',
  ZINC: 'Zinc'
} as const;

export type NutritionMineral =
  (typeof NUTRITION_MINERAL)[keyof typeof NUTRITION_MINERAL];
