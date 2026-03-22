import { z } from 'zod';

export const adminDashboardRangeValues = [
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

export const adminDashboardQuerySchema = z.object({
  range: z
    .enum(adminDashboardRangeValues, 'Khoảng thời gian không hợp lệ')
    .optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional()
});

export type AdminDashboardQuery = z.infer<typeof adminDashboardQuerySchema>;
