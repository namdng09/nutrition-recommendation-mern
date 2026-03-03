import { z } from 'zod';

import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { UNIT } from '~/shared/constants/unit';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const nutrientItemSchema = z.object({
  label: z.enum(Object.values(NUTRIENTS), 'Chất dinh dưỡng không hợp lệ'),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT), 'Đơn vị chất dinh dưỡng không hợp lệ')
});

const mineralItemSchema = z.object({
  label: z.enum(Object.values(NUTRITION_MINERAL), 'Khoáng chất không hợp lệ'),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT), 'Đơn vị khoáng chất không hợp lệ')
});

const vitaminItemSchema = z.object({
  label: z.enum(Object.values(NUTRITION_VITAMIN), 'Vitamin không hợp lệ'),
  value: z.coerce.number().min(0),
  unit: z.enum(Object.values(UNIT), 'Đơn vị vitamin không hợp lệ')
});

const detailNutritionSchema = z.object({
  nutrients: z.array(nutrientItemSchema).optional(),
  minerals: z.array(mineralItemSchema).optional(),
  vitamins: z.array(vitaminItemSchema).optional()
});

const unitSchema = z.object({
  value: z.coerce.number().min(0),
  unit: z.string().trim().min(1),
  isDefault: booleanSchema
});

export const createIngredientRequestSchema = z.object({
  name: z
    .string('Tên nguyên liệu không hợp lệ')
    .trim()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  categories: z.preprocess(
    parseJSON,
    z.array(
      z.enum(
        Object.values(INGREDIENT_CATEGORY),
        'Danh mục nguyên liệu không hợp lệ'
      ),
      'Danh mục nguyên liệu là bắt buộc'
    )
  ),
  baseUnit: z.preprocess(
    parseJSON,
    z.object(
      {
        amount: z.coerce.number().min(0),
        unit: z.string().trim().min(1)
      },
      'Đơn vị cơ bản là bắt buộc'
    )
  ),
  units: z.preprocess(parseJSON, z.array(unitSchema)).optional(),
  allergens: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  nutrition: z.preprocess(parseJSON, detailNutritionSchema).optional(),
  image: z.file().optional(),
  isActive: booleanSchema.optional()
});

export type CreateIngredientRequest = z.infer<
  typeof createIngredientRequestSchema
>;

export const updateIngredientRequestSchema =
  createIngredientRequestSchema.partial();

export type UpdateIngredientRequest = z.infer<
  typeof updateIngredientRequestSchema
>;
