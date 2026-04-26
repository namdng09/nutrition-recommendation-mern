import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  validate,
  validateQuery
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { AiEvaluationController } from './ai-evaluation-controller';
import {
  createTestCaseSchema,
  listMetricsQuerySchema,
  runEvaluationSchema,
  updateTestCaseSchema
} from './ai-evaluation-dto';

const router = Router();

router.use(authenticate(), authorize([ROLE.ADMIN]));

router.get('/presets', asyncHandler(AiEvaluationController.getPresetOptions));

router.get(
  '/metrics/summary',
  validateQuery(listMetricsQuerySchema.shape),
  asyncHandler(AiEvaluationController.getMetricsSummary)
);

router.get(
  '/metrics/trends',
  validateQuery(listMetricsQuerySchema.shape),
  asyncHandler(AiEvaluationController.getMetricsTrends)
);

router.get(
  '/metrics/by-source',
  validateQuery(listMetricsQuerySchema.shape),
  asyncHandler(AiEvaluationController.getMetricsBySource)
);

router.get('/test-cases', asyncHandler(AiEvaluationController.listTestCases));

router.post(
  '/test-cases',
  validate(createTestCaseSchema.shape),
  asyncHandler(AiEvaluationController.createTestCase)
);

router.put(
  '/test-cases/:id',
  validate(updateTestCaseSchema.shape),
  asyncHandler(AiEvaluationController.updateTestCase)
);

router.delete(
  '/test-cases/:id',
  asyncHandler(AiEvaluationController.deleteTestCase)
);

router.post(
  '/evaluations/run',
  validate(runEvaluationSchema.shape),
  asyncHandler(AiEvaluationController.runEvaluations)
);

router.get(
  '/evaluations/results',
  validateQuery(listMetricsQuerySchema.shape),
  asyncHandler(AiEvaluationController.listEvaluationResults)
);

router.get(
  '/evaluations/results/:metricId/detail',
  asyncHandler(AiEvaluationController.getEvaluationResultDetail)
);

export default router;
