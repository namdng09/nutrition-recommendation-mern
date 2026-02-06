import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { UserController } from './user-controller';
import {
  createUserRequestSchema,
  nutritionTargetRequestSchema,
  onboardingRequestSchema,
  updateUserRequestSchema
} from './user-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.ADMIN]),
  parseFormData,
  validate(createUserRequestSchema.shape),
  asyncHandler(UserController.createUser)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.viewUsers)
);

router.delete(
  '/',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.deleteBulk)
);

router.get('/me', authenticate(), asyncHandler(UserController.viewProfile));

router.post(
  '/me/onboarding',
  authenticate(),
  parseFormData,
  validate(onboardingRequestSchema.shape),
  asyncHandler(UserController.onboardUser)
);

router.post(
  '/me/nutrition-target',
  authenticate(),
  parseFormData,
  validate(nutritionTargetRequestSchema.shape),
  asyncHandler(UserController.calculateNutritionTarget)
);

router.put(
  '/me',
  authenticate(),
  handleSingleImageUpload('avatar'),
  asyncHandler(UserController.updateProfile)
);

router.get(
  '/:id',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.viewUserDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.ADMIN]),
  parseFormData,
  validate(updateUserRequestSchema.shape),
  asyncHandler(UserController.updateUser)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.deleteUser)
);

export default router;
