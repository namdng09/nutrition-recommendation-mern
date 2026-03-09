import { z } from 'zod';

import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const parseDate = (val: unknown) => {
  if (typeof val === 'string' || val instanceof Date) {
    const date = new Date(val as string | Date);
    if (isNaN(date.getTime())) {
      throw new Error('Ngày không hợp lệ');
    }
    return date;
  }
  throw new Error('Ngày không hợp lệ');
};

const dateSchema = z.preprocess(
  parseDate,
  z.date({ message: 'Ngày không hợp lệ' })
);

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
  notes: z.string().trim().optional()
});

export type UpdateGroceryRequest = z.infer<typeof updateGroceryRequestSchema>;

export const addGroceryIngredientRequestSchema = z.object({
  ingredients: z.preprocess(
    parseJSON,
    z
      .array(z.string().trim().min(1))
      .min(1, 'Phải có ít nhất 1 ID nguyên liệu để thêm')
  )
});

export type AddGroceryIngredientRequest = z.infer<
  typeof addGroceryIngredientRequestSchema
>;

export const removeGroceryIngredientRequestSchema = z.object({
  ingredients: z.preprocess(
    parseJSON,
    z
      .array(z.string().trim().min(1))
      .min(1, 'Phải có ít nhất 1 ID nguyên liệu để xóa')
  )
});

export type RemoveGroceryIngredientRequest = z.infer<
  typeof removeGroceryIngredientRequestSchema
>;

export const updateGroceryIngredientRequestSchema = z.object({
  isPurchased: booleanSchema.optional()
});

export type UpdateGroceryIngredientRequest = z.infer<
  typeof updateGroceryIngredientRequestSchema
>;
