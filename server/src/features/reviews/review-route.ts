import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { ReviewController } from './review-controller';
import {
  addCommentRequestSchema,
  rejectReviewRequestSchema,
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
  '/:id/pick-up',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(ReviewController.pickUpReview)
);

router.post(
  '/:id/comments',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  validate(addCommentRequestSchema.shape),
  asyncHandler(ReviewController.addComment)
);

router.post(
  '/:id/approve',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(ReviewController.approveReview)
);

router.post(
  '/:id/reject',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  validate(rejectReviewRequestSchema.shape),
  asyncHandler(ReviewController.rejectReview)
);

export default router;
