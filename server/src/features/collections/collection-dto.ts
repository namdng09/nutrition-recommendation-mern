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
    .transform(val => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isPublic phải là "true" hoặc "false"');
    })
    .optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  dishes: z.preprocess(parseJSON, z.array(z.string().trim())).optional()
});

export type CreateCollectionRequest = z.infer<
  typeof createCollectionRequestSchema
>;

export const updateCollectionRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .transform(val => {
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
  dishIds: z
    .array(z.string().trim().min(1, 'ID món ăn là bắt buộc'))
    .min(1, 'Cần ít nhất một món ăn')
});

export type AddDishToCollectionRequest = z.infer<
  typeof addDishToCollectionRequestSchema
>;

export const removeDishFromCollectionRequestSchema = z.object({
  dishIds: z
    .array(z.string().trim().min(1, 'ID món ăn là bắt buộc'))
    .min(1, 'Cần ít nhất một món ăn')
});

export type RemoveDishFromCollectionRequest = z.infer<
  typeof removeDishFromCollectionRequestSchema
>;
