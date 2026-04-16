import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validateQuery } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { DashboardController } from './dashboard-controller';
import { dashboardQuerySchema } from './dashboard-dto';

const router = Router();

router.get(
  '/admin',
  authenticate(),
  authorize([ROLE.ADMIN]),
  validateQuery(dashboardQuerySchema.shape),
  asyncHandler(DashboardController.viewAdminDashboard)
);

router.get(
  '/nutritionist',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validateQuery(dashboardQuerySchema.shape),
  asyncHandler(DashboardController.viewNutritionistDashboard)
);

export default router;
