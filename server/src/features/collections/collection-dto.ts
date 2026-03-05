import { z } from 'zod';

import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

export const createCollectionRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự'),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: booleanSchema.optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  dishes: z
    .preprocess(
      parseJSON,
      z.array(z.string().trim()).min(1, 'Phải có ít nhất một món ăn')
    )
    .optional()
});

export type CreateCollectionRequest = z.infer<
  typeof createCollectionRequestSchema
>;

export const updateCollectionRequestSchema = z.object({
  name: z.string().trim().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: booleanSchema.optional(),
  tags: z.preprocess(parseJSON, z.array(z.string().trim())).optional(),
  dishes: z.preprocess(parseJSON, z.array(z.string().trim())).optional()
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

export const deleteBulkCollectionRequestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, 'Cần ít nhất một ID bộ sưu tập')
});

export type DeleteBulkCollectionRequest = z.infer<
  typeof deleteBulkCollectionRequestSchema
>;
