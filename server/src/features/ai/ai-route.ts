import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { AiController } from './ai-controller';
import {
  askAgentRequestSchema,
  recommendDailyMealsRequestSchema,
  recommendDailyWorkoutRequestSchema
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

router.post(
  '/recommend-daily-workout',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(recommendDailyWorkoutRequestSchema.shape),
  asyncHandler(AiController.recommendDailyWorkout)
);

export default router;
