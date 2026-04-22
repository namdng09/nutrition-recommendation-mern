import { z } from 'zod';

export const aiMetricSourceSchema = z.enum([
  'evaluation',
  'production',
  'both'
]);

export const listMetricsQuerySchema = z.object({
  source: aiMetricSourceSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  endpoint: z
    .enum(['ask_agent', 'recommend_daily_meals', 'recommend_daily_workout'])
    .optional(),
  granularity: z.enum(['hour', 'day']).optional()
});

export type ListMetricsQuery = z.infer<typeof listMetricsQuerySchema>;

export const createTestCaseSchema = z.object({
  name: z.string().trim().min(1, 'name là bắt buộc'),
  description: z.string().optional(),
  endpoint: z
    .enum(['ask_agent', 'recommend_daily_meals', 'recommend_daily_workout'])
    .default('ask_agent'),
  category: z
    .enum(['happy_path', 'edge_case', 'constraint_test', 'error_case'])
    .default('happy_path'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  input: z.record(z.string(), z.unknown()),
  expected: z
    .object({
      classification: z.enum(['positive', 'negative']).default('positive'),
      exact: z.string().optional(),
      mustInclude: z.array(z.string()).optional(),
      regex: z.string().optional(),
      notes: z.string().optional()
    })
    .optional()
});

export type CreateTestCaseRequest = z.infer<typeof createTestCaseSchema>;

export const updateTestCaseSchema = createTestCaseSchema.partial();

export const runEvaluationSchema = z.object({
  testCaseIds: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(200).optional()
});

export type RunEvaluationRequest = z.infer<typeof runEvaluationSchema>;
