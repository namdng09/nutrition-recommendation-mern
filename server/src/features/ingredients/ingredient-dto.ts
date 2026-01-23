import { z } from 'zod';

export const createIngredientRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  category: z.string().min(2, 'Category must be at least 2 characters long'),
  unit: z.string().min(1, 'Unit is required'),
  caloriesPer100g: z.coerce.number().min(0, 'Calories must be non-negative'),
  protein: z.coerce.number().min(0, 'Protein must be non-negative'),
  carbs: z.coerce.number().min(0, 'Carbs must be non-negative').optional(),
  fat: z.coerce.number().min(0, 'Fat must be non-negative').optional(),
  fiber: z.coerce.number().min(0, 'Fiber must be non-negative').optional(),
  allergens: z.array(z.string()).optional(),
  image: z.file().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isActive must be "true" or "false"');
    })
    .optional()
});

export type CreateIngredientRequest = z.infer<
  typeof createIngredientRequestSchema
>;

export const updateIngredientRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters long')
    .optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  caloriesPer100g: z.coerce.number().min(0, 'Calories must be non-negative').optional(),
  protein: z.coerce.number().min(0, 'Protein must be non-negative').optional(),
  carbs: z.coerce.number().min(0, 'Carbs must be non-negative').optional(),
  fat: z.coerce.number().min(0, 'Fat must be non-negative').optional(),
  fiber: z.coerce.number().min(0, 'Fiber must be non-negative').optional(),
  allergens: z.array(z.string()).optional(),
  image: z.file().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isActive must be true or false');
    })
    .optional()
});

export type UpdateIngredientRequest = z.infer<
  typeof updateIngredientRequestSchema
>;
