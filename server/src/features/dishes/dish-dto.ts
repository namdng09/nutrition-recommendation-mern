import { z } from 'zod';

import { DISH_CATEGORY } from '~/shared/constants/dish-category';

const parseJSON = (val: any) => {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
};

const unitSchema = z.object({
  value: z.coerce.number().min(0, 'Giá trị phải lớn hơn hoặc bằng 0'),
  quantity: z.coerce.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  unit: z.string().trim().min(1, 'Đơn vị không được để trống'),
  isDefault: z.preprocess(parseBoolean, z.coerce.boolean())
});

const dishIngredientSchema = z.object({
  ingredientId: z.string().trim().min(1, 'ID nguyên liệu không được để trống'),
  units: z.preprocess(
    parseJSON,
    z.array(unitSchema).min(1, 'Phải có ít nhất 1 đơn vị')
  )
});

const instructionSchema = z.object({
  step: z.coerce.number().min(1, 'Bước phải lớn hơn hoặc bằng 1'),
  description: z.string().trim().min(1, 'Mô tả bước không được để trống')
});

export const createDishRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  categories: z.preprocess(
    parseJSON,
    z
      .array(z.enum(Object.values(DISH_CATEGORY)))
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
  image: z.file().optional(),
  preparationTime: z.coerce.number().min(0).optional(),
  cookTime: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1).optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional(),
  isPublic: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type CreateDishRequest = z.infer<typeof createDishRequestSchema>;

export const updateDishRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  description: z.string().trim().optional(),
  categories: z
    .preprocess(
      parseJSON,
      z
        .array(z.enum(Object.values(DISH_CATEGORY)))
        .min(1, 'Phải có ít nhất 1 danh mục')
    )
    .optional(),
  ingredients: z
    .preprocess(
      parseJSON,
      z.array(dishIngredientSchema).min(1, 'Phải có ít nhất 1 nguyên liệu')
    )
    .optional(),
  instructions: z
    .preprocess(
      parseJSON,
      z.array(instructionSchema).min(1, 'Phải có ít nhất 1 bước hướng dẫn')
    )
    .optional(),
  image: z.file().optional(),
  preparationTime: z.coerce.number().min(0).optional(),
  cookTime: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1).optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional(),
  isPublic: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type UpdateDishRequest = z.infer<typeof updateDishRequestSchema>;
