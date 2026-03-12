import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { ActivityController } from './activity-controller';
import {
  createActivityRequestSchema,
  updateActivityRequestSchema
} from './activity-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleSingleImageUpload('tutorial'),
  validate(createActivityRequestSchema.shape),
  asyncHandler(ActivityController.createActivity)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(ActivityController.viewActivities)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(ActivityController.viewActivityDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleSingleImageUpload('tutorial'),
  validate(updateActivityRequestSchema.shape),
  asyncHandler(ActivityController.updateActivity)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(ActivityController.deleteActivity)
);

export default router;
