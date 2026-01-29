import { Router } from 'express';

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
  onboardingRequestSchema,
  updateUserRequestSchema
} from './user-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize(['admin']),
  parseFormData,
  validate(createUserRequestSchema.shape),
  asyncHandler(UserController.createUser)
);

router.get(
  '/',
  authenticate(),
  authorize(['admin']),
  asyncHandler(UserController.viewUsers)
);

router.delete(
  '/',
  authenticate(),
  authorize(['admin']),
  asyncHandler(UserController.deleteBulk)
);

router.get('/me', authenticate(), asyncHandler(UserController.viewProfile));

router.post(
  '/me/onboarding',
  authenticate(),
  validate(onboardingRequestSchema.shape),
  asyncHandler(UserController.onboardUser)
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
  authorize(['admin']),
  asyncHandler(UserController.viewUserDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize(['admin']),
  parseFormData,
  validate(updateUserRequestSchema.shape),
  asyncHandler(UserController.updateUser)
);

router.delete(
  '/:id',
  authenticate(),
  authorize(['admin']),
  asyncHandler(UserController.deleteUser)
);

export default router;
