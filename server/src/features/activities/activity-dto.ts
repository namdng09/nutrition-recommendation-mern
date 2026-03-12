import { z } from 'zod';

import { ACTIVITY_DIFFICULTY } from '~/shared/constants/activity-difficulty';
import { ACTIVITY_TYPE } from '~/shared/constants/activity-type';
import { booleanSchema, parseJSON } from '~/shared/utils/dto-parsers';

const activityBodyPartSchema = z.object({
  name: z
    .string('Tên nhóm cơ/dụng cụ không hợp lệ')
    .trim()
    .min(1, 'Tên nhóm cơ/dụng cụ không được để trống'),
  image: z.string().trim().optional()
});

export const createActivityRequestSchema = z.object({
  name: z
    .string('Tên hoạt động không hợp lệ')
    .trim()
    .min(2, 'Tên hoạt động phải có ít nhất 2 ký tự'),
  tutorial: z.string().trim().optional(),
  instructions: z
    .string('Hướng dẫn không hợp lệ')
    .trim()
    .min(1, 'Hướng dẫn không được để trống'),
  difficulty: z.enum(Object.values(ACTIVITY_DIFFICULTY), 'Độ khó không hợp lệ'),
  type: z.enum(Object.values(ACTIVITY_TYPE), 'Loại hoạt động không hợp lệ'),
  muscles: z.preprocess(parseJSON, z.array(activityBodyPartSchema)).optional(),
  equipments: z
    .preprocess(parseJSON, z.array(activityBodyPartSchema))
    .optional(),
  isActive: booleanSchema.optional()
});

export type CreateActivityRequest = z.infer<typeof createActivityRequestSchema>;

export const updateActivityRequestSchema =
  createActivityRequestSchema.partial();

export type UpdateActivityRequest = z.infer<typeof updateActivityRequestSchema>;
