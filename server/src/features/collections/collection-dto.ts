import { z } from 'zod';

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

export const createCollectionRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isPublic phải là "true" hoặc "false"');
    })
    .optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  dishes: z.preprocess(
    parseJSON,
    z
      .array(
        z.object({
          dishId: z.string().trim(),
          name: z.string().trim(),
          calories: z.number().optional(),
          image: z.string().trim().optional()
        })
      )
  ).optional()
});

export type CreateCollectionRequest = z.infer<
  typeof createCollectionRequestSchema
>;

export const updateCollectionRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .optional(),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isPublic phải là "true" hoặc "false"');
    })
    .optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional()
});

export type UpdateCollectionRequest = z.infer<
  typeof updateCollectionRequestSchema
>;

export const addDishToCollectionRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn là bắt buộc'),
  name: z.string().trim().min(1, 'Tên món ăn là bắt buộc'),
  calories: z.number().optional(),
  image: z.string().trim().optional()
});

export type AddDishToCollectionRequest = z.infer<
  typeof addDishToCollectionRequestSchema
>;

export const removeDishFromCollectionRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'ID món ăn là bắt buộc')
});

export type RemoveDishFromCollectionRequest = z.infer<
  typeof removeDishFromCollectionRequestSchema
>;
