import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { FeedbackController } from './feedback-controller';
import { createFeedbackRequestSchema } from './feedback-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(createFeedbackRequestSchema.shape),
  asyncHandler(FeedbackController.createFeedback)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.ADMIN, ROLE.NUTRITIONIST]),
  asyncHandler(FeedbackController.viewFeedbacks)
);

router.get(
  '/:id',
  authenticate(),
  authorize([ROLE.ADMIN, ROLE.NUTRITIONIST]),
  asyncHandler(FeedbackController.viewFeedbackDetail)
);

export default router;
