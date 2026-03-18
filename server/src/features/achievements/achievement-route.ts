import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { AchievementController } from './achievement-controller';

const router = Router();

// Public — anyone can browse achievement definitions
router.get('/', asyncHandler(AchievementController.getAllDefinitions));

router.get(
  '/me',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(AchievementController.getUserAchievements)
);

export default router;
