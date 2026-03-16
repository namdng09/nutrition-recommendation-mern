import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import {
  asyncHandler,
  handleCertificateUpload,
  handleSingleImageUpload
} from '~/shared/utils';

import { UserController } from './user-controller';
import {
  blockDishRequestSchema,
  blockIngredientRequestSchema,
  createUserRequestSchema,
  deleteBulkRequestSchema,
  favoriteCollectionRequestSchema,
  favoriteDishRequestSchema,
  favoriteIngredientRequestSchema,
  nutritionTargetRequestSchema,
  onboardingRequestSchema,
  rejectCertificateRequestSchema,
  updateAllergensSchema,
  updateNutritionTargetSchema,
  updatePhysicalStatsSchema,
  updateProfileSchema,
  updateRestrictionsSchema,
  updateScheduleSettingsSchema,
  updateUserRequestSchema,
  uploadCertificateRequestSchema
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
  validate(deleteBulkRequestSchema.shape),
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
  '/me/profile',
  authenticate(),
  handleSingleImageUpload('avatar'),
  validate(updateProfileSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.put(
  '/me/physical-stats',
  authenticate(),
  parseFormData,
  validate(updatePhysicalStatsSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.put(
  '/me/nutrition-target',
  authenticate(),
  parseFormData,
  validate(updateNutritionTargetSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.put(
  '/me/restrictions',
  authenticate(),
  parseFormData,
  validate(updateRestrictionsSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.put(
  '/me/allergens',
  authenticate(),
  parseFormData,
  validate(updateAllergensSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.put(
  '/me/schedule-settings',
  authenticate(),
  parseFormData,
  validate(updateScheduleSettingsSchema.shape),
  asyncHandler(UserController.updateProfile)
);

router.post(
  '/me/favorites/dishes',
  authenticate(),
  parseFormData,
  validate(favoriteDishRequestSchema.shape),
  asyncHandler(UserController.addFavoriteDish)
);

router.delete(
  '/me/favorites/dishes',
  authenticate(),
  parseFormData,
  validate(favoriteDishRequestSchema.shape),
  asyncHandler(UserController.removeFavoriteDish)
);

router.post(
  '/me/favorites/ingredients',
  authenticate(),
  parseFormData,
  validate(favoriteIngredientRequestSchema.shape),
  asyncHandler(UserController.addFavoriteIngredient)
);

router.delete(
  '/me/favorites/ingredients',
  authenticate(),
  parseFormData,
  validate(favoriteIngredientRequestSchema.shape),
  asyncHandler(UserController.removeFavoriteIngredient)
);

router.post(
  '/me/favorites/collections',
  authenticate(),
  parseFormData,
  validate(favoriteCollectionRequestSchema.shape),
  asyncHandler(UserController.addFavoriteCollection)
);

router.delete(
  '/me/favorites/collections',
  authenticate(),
  parseFormData,
  validate(favoriteCollectionRequestSchema.shape),
  asyncHandler(UserController.removeFavoriteCollection)
);

router.post(
  '/me/blocks/dishes',
  authenticate(),
  parseFormData,
  validate(blockDishRequestSchema.shape),
  asyncHandler(UserController.addBlockDish)
);

router.delete(
  '/me/blocks/dishes',
  authenticate(),
  parseFormData,
  validate(blockDishRequestSchema.shape),
  asyncHandler(UserController.removeBlockDish)
);

router.post(
  '/me/blocks/ingredients',
  authenticate(),
  parseFormData,
  validate(blockIngredientRequestSchema.shape),
  asyncHandler(UserController.addBlockIngredient)
);

router.delete(
  '/me/blocks/ingredients',
  authenticate(),
  parseFormData,
  validate(blockIngredientRequestSchema.shape),
  asyncHandler(UserController.removeBlockIngredient)
);

router.post(
  '/me/certificate',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleCertificateUpload('certificate'),
  validate(uploadCertificateRequestSchema.shape),
  asyncHandler(UserController.uploadCertificate)
);

router.get(
  '/pending-certificates/count',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.pendingCertificatesCount)
);

router.put(
  '/:id/certificate/approve',
  authenticate(),
  authorize([ROLE.ADMIN]),
  asyncHandler(UserController.approveCertificate)
);

router.put(
  '/:id/certificate/reject',
  authenticate(),
  authorize([ROLE.ADMIN]),
  parseFormData,
  validate(rejectCertificateRequestSchema.shape),
  asyncHandler(UserController.rejectCertificate)
);

router.get('/nutritionists', asyncHandler(UserController.viewNutritionists));

router.get(
  '/:id/profile',
  asyncHandler(UserController.viewNutritionistProfile)
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
