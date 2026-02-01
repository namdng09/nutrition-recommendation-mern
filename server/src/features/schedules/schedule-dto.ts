import { z } from 'zod';

import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { MEAL_TYPE } from '~/shared/constants/meal-type';

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

const scheduleDishSchema = z.object({
  dishId: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Tên món ăn là bắt buộc'),
  calories: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(0).optional(),
  image: z.string().trim().optional()
});

const scheduleMealSchema = z.object({
  mealType: z.enum(Object.values(MEAL_TYPE), { message: 'Invalid meal type' }),
  notes: z.string().trim().optional(),
  dishes: z.preprocess(parseJSON, z.array(scheduleDishSchema)).optional()
});

export const createScheduleRequestSchema = z.object({
  date: z.coerce.date(),
  dayOfWeek: z.enum(Object.values(DAY_OF_WEEK), {
    message: 'Invalid day of week'
  })
});

export type CreateScheduleRequest = z.infer<typeof createScheduleRequestSchema>;

export const updateScheduleRequestSchema = z.object({
  date: z.coerce.date().optional(),
  dayOfWeek: z
    .enum(Object.values(DAY_OF_WEEK), { message: 'Invalid day of week' })
    .optional(),
  meals: z.preprocess(parseJSON, z.array(scheduleMealSchema)).optional()
});

export type UpdateScheduleRequest = z.infer<typeof updateScheduleRequestSchema>;

const scheduleMealUpdateSchema = z.object({
  mealType: z.enum(Object.values(MEAL_TYPE), { message: 'Invalid meal type' }),
  notes: z.string().trim().optional(),
  dishes: z
    .preprocess(
      parseJSON,
      z.array(
        z.object({
          dishId: z.string().trim().min(1, 'Dish ID is required'),
          servings: z.coerce.number().min(0).optional()
        })
      )
    )
    .optional()
});

export const updateScheduleMealsRequestSchema = z.object({
  meals: z.preprocess(parseJSON, z.array(scheduleMealUpdateSchema))
});

export type UpdateScheduleMealsRequest = z.infer<
  typeof updateScheduleMealsRequestSchema
>;
