import { z } from 'zod';

import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { UNIT } from '~/shared/constants/unit';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const unitSchema = z.object({
  quantity: z.coerce.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  unit: z.string().trim().min(1, 'Đơn vị không được để trống'),
  isDefault: booleanSchema
});

const dishIngredientSchema = z.object({
  ingredientId: z.string().trim().min(1, 'ID nguyên liệu không được để trống'),
  units: z.preprocess(
    parseJSON,
    z
      .array(unitSchema)
      .min(1, 'Phải có ít nhất 1 đơn vị')
      .refine(
        units => units?.some(unit => unit.unit === 'g'),
        'Phải có đơn vị gram (g)'
      )
  )
});

const instructionSchema = z.object({
  step: z.coerce.number().min(1, 'Bước phải lớn hơn hoặc bằng 1'),
  description: z.string().trim().min(1, 'Mô tả bước không được để trống')
});

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

export const createDishRequestSchema = z.object({
  name: z
    .string('Tên món ăn không hợp lệ')
    .trim()
    .min(2, 'Tên món ăn phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  categories: z.preprocess(
    parseJSON,
    z
      .array(
        z.enum(Object.values(DISH_CATEGORY), 'Danh mục món ăn không hợp lệ')
      )
      .min(1, 'Phải có ít nhất 1 danh mục')
  ),
  ingredients: z.preprocess(
    parseJSON,
    z.array(dishIngredientSchema).min(1, 'Phải có ít nhất 1 nguyên liệu')
  ),
  instructions: z.preprocess(
    parseJSON,
    z.array(instructionSchema).min(1, 'Phải có ít nhất 1 bước hướng dẫn')
  ),
  nutrition: z.preprocess(parseJSON, detailNutritionSchema).optional(),
  image: z.file().optional(),
  preparationTime: z.coerce
    .number()
    .min(1, 'Số phút phải lớn hơn hoặc bằng 1')
    .optional(),
  cookTime: z.coerce
    .number()
    .min(1, 'Số phút phải lớn hơn hoặc bằng 1')
    .optional(),
  servings: z.coerce
    .number()
    .min(1, 'Số lượng phải lớn hơn hoặc bằng 1')
    .optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  nutritionFocus: z.preprocess(
    parseJSON,
    z
      .array(
        z.enum(
          Object.values(NUTRITION_FOCUS),
          'Danh mục dinh dưỡng không hợp lệ'
        )
      )
      .min(1, 'Phải có ít nhất 1 danh mục')
  ),
  isActive: booleanSchema.optional(),
  isPublic: booleanSchema.optional()
});

export type CreateDishRequest = z.infer<typeof createDishRequestSchema>;

export const updateDishRequestSchema = createDishRequestSchema.partial();

export type UpdateDishRequest = z.infer<typeof updateDishRequestSchema>;

export const deleteBulkRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, 'Cần ít nhất một ID món ăn')
});

export type DeleteBulkRequest = z.infer<typeof deleteBulkRequestSchema>;
