import { z } from 'zod';

export const createCollectionRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isPublic must be "true" or "false"');
    })
    .optional(),
  tags: z.array(z.string().trim()).optional(),
  dishes: z
    .array(
      z.object({
        dishId: z.string().trim(),
        name: z.string().trim(),
        calories: z.number().optional(),
        image: z.string().trim().optional()
      })
    )
    .optional()
});

export type CreateCollectionRequest = z.infer<
  typeof createCollectionRequestSchema
>;

export const updateCollectionRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .optional(),
  description: z.string().trim().optional(),
  image: z.file().optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isPublic must be "true" or "false"');
    })
    .optional(),
  tags: z.array(z.string().trim()).optional()
});

export type UpdateCollectionRequest = z.infer<
  typeof updateCollectionRequestSchema
>;

export const addDishToCollectionRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'Dish ID is required'),
  name: z.string().trim().min(1, 'Dish name is required'),
  calories: z.number().optional(),
  image: z.string().trim().optional()
});

export type AddDishToCollectionRequest = z.infer<
  typeof addDishToCollectionRequestSchema
>;

export const removeDishFromCollectionRequestSchema = z.object({
  dishId: z.string().trim().min(1, 'Dish ID is required')
});

export type RemoveDishFromCollectionRequest = z.infer<
  typeof removeDishFromCollectionRequestSchema
>;
