import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validateQuery } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { DashboardController } from './dashboard-controller';
import { adminDashboardQuerySchema } from './dashboard-dto';

const router = Router();

router.get(
  '/admin',
  authenticate(),
  authorize([ROLE.ADMIN]),
  validateQuery(adminDashboardQuerySchema.shape),
  asyncHandler(DashboardController.viewAdminDashboard)
);

router.get(
  '/nutritionist',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(DashboardController.viewNutritionistDashboard)
);

export default router;
