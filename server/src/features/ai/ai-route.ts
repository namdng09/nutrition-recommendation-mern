import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { AiController } from './ai-controller';
import {
  askAgentRequestSchema,
  recommendDailyMealsRequestSchema
} from './ai-dto';

const router = Router();

router.post(
  '/ask',
  validate(askAgentRequestSchema.shape),
  asyncHandler(AiController.askAgent)
);

router.post(
  '/recommend-daily-meals',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(recommendDailyMealsRequestSchema.shape),
  asyncHandler(AiController.recommendDailyMeals)
);

export default router;
