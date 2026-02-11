import { z } from 'zod';

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
  }
  return val;
};

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

const parseDate = (val: any) => {
  if (typeof val === 'string' || val instanceof Date) {
    return new Date(val);
  }
  return val;
};

const dateSchema = z.preprocess(
  parseDate,
  z.date({ message: 'Ngày không hợp lệ' })
);

const ingredientItemSchema = z.object({
  ingredientId: z
    .string({ message: 'ID nguyên liệu không hợp lệ' })
    .trim()
    .min(1),
  isPurchased: z.preprocess(parseBoolean, z.coerce.boolean()).optional(),
  notes: z.string().trim().optional()
});

export const createGroceryRequestSchema = z.object({
  name: z
    .string({ message: 'Tên danh sách mua sắm không hợp lệ' })
    .trim()
    .min(2, 'Tên danh sách mua sắm phải có ít nhất 2 ký tự'),
  date: z.preprocess(parseJSON, z.array(dateSchema)).optional()
});

export type CreateGroceryRequest = z.infer<typeof createGroceryRequestSchema>;

export const updateGroceryRequestSchema = z.object({
  name: z
    .string({ message: 'Tên danh sách mua sắm không hợp lệ' })
    .trim()
    .min(2, 'Tên danh sách mua sắm phải có ít nhất 2 ký tự')
    .optional(),
  date: z.preprocess(parseJSON, z.array(dateSchema)).optional(),
  ingredients: z.preprocess(parseJSON, z.array(ingredientItemSchema)).optional()
});

export type UpdateGroceryRequest = z.infer<typeof updateGroceryRequestSchema>;

export const addIngredientsRequestSchema = z.object({
  ingredients: z.preprocess(
    parseJSON,
    z
      .array(ingredientItemSchema)
      .min(1, 'Phải có ít nhất 1 nguyên liệu để thêm')
  )
});

export type AddIngredientsRequest = z.infer<typeof addIngredientsRequestSchema>;

export const removeIngredientsRequestSchema = z.object({
  ingredients: z.preprocess(
    parseJSON,
    z
      .array(z.string().trim().min(1))
      .min(1, 'Phải có ít nhất 1 ID nguyên liệu để xóa')
  )
});

export type RemoveIngredientsRequest = z.infer<
  typeof removeIngredientsRequestSchema
>;

const updateIngredientItemSchema = z.object({
  ingredientId: z
    .string({ message: 'ID nguyên liệu không hợp lệ' })
    .trim()
    .min(1),
  isPurchased: z.preprocess(parseBoolean, z.coerce.boolean()).optional(),
  notes: z.string().trim().optional()
});

export const updateIngredientsInGrocerySchema = z.object({
  ingredients: z.preprocess(
    parseJSON,
    z
      .array(updateIngredientItemSchema)
      .min(1, 'Phải có ít nhất 1 nguyên liệu để cập nhật')
  )
});

export type UpdateIngredientsInGroceryRequest = z.infer<
  typeof updateIngredientsInGrocerySchema
>;
