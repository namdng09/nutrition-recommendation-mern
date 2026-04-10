import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { ReviewController } from './review-controller';
import {
  evaluateReviewRequestSchema,
  submitReviewRequestSchema
} from './review-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER]),
  validate(submitReviewRequestSchema.shape),
  asyncHandler(ReviewController.submitReview)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(ReviewController.viewReviews)
);

router.get(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(ReviewController.viewReviewDetail)
);

router.post(
  '/:id/evaluate',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validate(evaluateReviewRequestSchema.shape),
  asyncHandler(ReviewController.evaluateReview)
);

export default router;
