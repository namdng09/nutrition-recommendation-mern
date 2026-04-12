import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authenticateSse, authorize } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { AchievementController } from './achievement-controller';

const router = Router();

router.get('/sse', authenticateSse, AchievementController.subscribe);

router.get(
  '/me',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(AchievementController.getUserAchievements)
);

export default router;
