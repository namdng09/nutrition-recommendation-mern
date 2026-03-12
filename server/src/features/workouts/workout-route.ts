import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { WorkoutController } from './workout-controller';
import {
  createWorkoutRequestSchema,
  updateWorkoutRequestSchema
} from './workout-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  parseFormData,
  validate(createWorkoutRequestSchema.shape),
  asyncHandler(WorkoutController.createWorkout)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(WorkoutController.viewWorkouts)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(WorkoutController.viewWorkoutDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  parseFormData,
  validate(updateWorkoutRequestSchema.shape),
  asyncHandler(WorkoutController.updateWorkout)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(WorkoutController.deleteWorkout)
);

export default router;
