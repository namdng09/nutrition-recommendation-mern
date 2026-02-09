export const UNIT = {
  GRAM: 'g',
  KILOGRAM: 'kg',
  MILLIGRAM: 'mg',
  MICROGRAM: 'μg',
  MILLILITER: 'ml',
  LITER: 'l',
  OUNCE: 'oz',
  POUND: 'lb',
  KILOCALORIE: 'kcal',
  IU: 'IU'
} as const;

export type Unit = (typeof UNIT)[keyof typeof UNIT];
