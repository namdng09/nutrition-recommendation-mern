import { z } from 'zod';

import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { UNIT } from '~/shared/constants/unit';

const nutrientValueSchema = z.object({
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT))
});

const nutrientsSchema = z.object({
  calories: nutrientValueSchema,
  carbs: nutrientValueSchema,
  fat: nutrientValueSchema,
  protein: nutrientValueSchema,
  fiber: nutrientValueSchema,
  sodium: nutrientValueSchema,
  cholesterol: nutrientValueSchema
});

const nutritionItemSchema = z.object({
  label: z.string().trim(),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT))
});

const detailNutritionSchema = z.object({
  nutrients: nutrientsSchema.optional(),
  minerals: z.array(nutritionItemSchema).optional(),
  vitamins: z.array(nutritionItemSchema).optional(),
  sugars: z.array(nutritionItemSchema).optional(),
  fats: z.array(nutritionItemSchema).optional(),
  fattyAcids: z.array(nutritionItemSchema).optional(),
  aminoAcids: z.array(nutritionItemSchema).optional()
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
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự'),
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
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
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
