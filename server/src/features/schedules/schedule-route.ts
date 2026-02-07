import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { ScheduleController } from './schedule-controller';
import {
  createScheduleRequestSchema,
  updateScheduleDishStatusRequestSchema,
  updateScheduleMealsRequestSchema,
  updateScheduleRequestSchema
} from './schedule-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  parseFormData,
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
  parseFormData,
  validate(updateScheduleRequestSchema.shape),
  asyncHandler(ScheduleController.updateSchedule)
);

router.put(
  '/:id/meals',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(updateScheduleMealsRequestSchema.shape),
  asyncHandler(ScheduleController.updateScheduleMeals)
);

router.put(
  '/:id/meals/:mealType/dishes/:dishId/is-eaten',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(updateScheduleDishStatusRequestSchema.shape),
  asyncHandler(ScheduleController.updateScheduleDishStatus)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ScheduleController.deleteSchedule)
);

router.delete(
  '/:id/meals/:mealType/dishes/:dishId',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ScheduleController.removeScheduleDish)
);

router.delete(
  '/:id/meals/:mealType/dishes',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(ScheduleController.clearScheduleMealDishes)
);

export default router;
