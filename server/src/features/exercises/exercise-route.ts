import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { ExerciseController } from './exercise-controller';
import {
  createExerciseRequestSchema,
  updateExerciseRequestSchema
} from './exercise-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleSingleImageUpload('tutorial'),
  validate(createExerciseRequestSchema.shape),
  asyncHandler(ExerciseController.createExercise)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(ExerciseController.viewExercises)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(ExerciseController.viewExerciseDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleSingleImageUpload('tutorial'),
  validate(updateExerciseRequestSchema.shape),
  asyncHandler(ExerciseController.updateExercise)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(ExerciseController.deleteExercise)
);

export default router;
