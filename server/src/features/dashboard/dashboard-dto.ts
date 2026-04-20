import { z } from 'zod';

export const dashboardRangeValues = [
  'today',
  'yesterday',
  'last7days',
  'last30days',
  'thisMonth',
  'lastMonth',
  'thisYear',
  'allTime',
  'custom'
] as const;

export const dashboardQuerySchema = z.object({
  range: z
    .enum(dashboardRangeValues, 'Khoảng thời gian không hợp lệ')
    .optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional()
});

export type dashboardQuery = z.infer<typeof dashboardQuerySchema>;
