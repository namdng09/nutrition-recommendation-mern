import { z } from 'zod';

import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { UNIT } from '~/shared/constants/unit';

const enumValues = <T extends Record<string, string>>(values: T) =>
  z.enum(Object.values(values) as [string, ...string[]]);

const nutrientItemSchema = z.object({
  label: enumValues(NUTRIENTS),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT))
});

const mineralItemSchema = z.object({
  label: enumValues(NUTRITION_MINERAL),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT))
});

const vitaminItemSchema = z.object({
  label: enumValues(NUTRITION_VITAMIN),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT))
});

const detailNutritionSchema = z.object({
  nutrients: z.array(nutrientItemSchema).optional(),
  minerals: z.array(mineralItemSchema).optional(),
  vitamins: z.array(vitaminItemSchema).optional()
});

const baseUnitSchema = z.object({
  amount: z.coerce.number().min(0),
  unit: z.string().trim().min(1)
});

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
};

const unitSchema = z.object({
  value: z.coerce.number().min(0),
  unit: z.string().trim().min(1),
  isDefault: z.preprocess(parseBoolean, z.coerce.boolean())
});

const parseJSON = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

export const createIngredientRequestSchema = z.object({
  name: z
    .string('Tên nguyên liệu không hợp lệ')
    .trim()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  categories: z.preprocess(
    parseJSON,
    z.array(z.enum(Object.values(INGREDIENT_CATEGORY)))
  ),
  baseUnit: z.preprocess(parseJSON, baseUnitSchema),
  units: z.preprocess(parseJSON, z.array(unitSchema)).optional(),
  allergens: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  nutrition: z.preprocess(parseJSON, detailNutritionSchema).optional(),
  image: z.file().optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type CreateIngredientRequest = z.infer<
  typeof createIngredientRequestSchema
>;

export const updateIngredientRequestSchema = z.object({
  name: z
    .string('Tên nguyên liệu không hợp lệ')
    .trim()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự')
    .optional(),
  description: z.string().trim().optional(),
  categories: z
    .preprocess(parseJSON, z.array(z.enum(Object.values(INGREDIENT_CATEGORY))))
    .optional(),
  baseUnit: z.preprocess(parseJSON, baseUnitSchema).optional(),
  units: z.preprocess(parseJSON, z.array(unitSchema)).optional(),
  allergens: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  nutrition: z.preprocess(parseJSON, detailNutritionSchema).optional(),
  image: z.file().optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type UpdateIngredientRequest = z.infer<
  typeof updateIngredientRequestSchema
>;
