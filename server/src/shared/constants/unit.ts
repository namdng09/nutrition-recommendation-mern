export const UNIT = {
  GRAM: 'g',
  KILOGRAM: 'kg',
  MILLILITER: 'ml',
  LITER: 'l',
  TEASPOON: 'tsp',
  TABLESPOON: 'tbsp',
  CUP: 'cup',
  PIECE: 'piece',
  SLICE: 'slice',
  OUNCE: 'oz',
  POUND: 'lb'
} as const;

export type Unit = (typeof UNIT)[keyof typeof UNIT];
