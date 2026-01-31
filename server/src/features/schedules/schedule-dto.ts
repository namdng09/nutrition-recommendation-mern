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

const parseBoolean = (val: any) => {
  if (typeof val === 'string') {
    if (val === 'true') return true;
    if (val === 'false') return false;
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
  dishes: z.preprocess(parseJSON, z.array(scheduleDishSchema)).optional()
});

export const createScheduleRequestSchema = z.object({
  date: z.coerce.date(),
  dayOfWeek: z.enum(Object.values(DAY_OF_WEEK), {
    message: 'Invalid day of week'
  }),
  // meals: z.preprocess(parseJSON, z.array(scheduleMealSchema)).optional(),
  notes: z.string().trim().optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type CreateScheduleRequest = z.infer<typeof createScheduleRequestSchema>;

export const updateScheduleRequestSchema = z.object({
  date: z.coerce.date().optional(),
  dayOfWeek: z
    .enum(Object.values(DAY_OF_WEEK), { message: 'Invalid day of week' })
    .optional(),
  meals: z.preprocess(parseJSON, z.array(scheduleMealSchema)).optional(),
  notes: z.string().trim().optional(),
  isActive: z.preprocess(parseBoolean, z.coerce.boolean()).optional()
});

export type UpdateScheduleRequest = z.infer<typeof updateScheduleRequestSchema>;
