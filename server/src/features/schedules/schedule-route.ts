import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { ScheduleController } from './schedule-controller';
import {
  createScheduleRequestSchema,
  updateScheduleRequestSchema
} from './schedule-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(createScheduleRequestSchema.shape),
  asyncHandler(ScheduleController.createSchedule)
);

router.get('/', authenticate(), asyncHandler(ScheduleController.viewSchedules));

router.get(
  '/:id',
  authenticate(),
  asyncHandler(ScheduleController.viewScheduleDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(updateScheduleRequestSchema.shape),
  asyncHandler(ScheduleController.updateSchedule)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(ScheduleController.deleteSchedule)
);

export default router;
