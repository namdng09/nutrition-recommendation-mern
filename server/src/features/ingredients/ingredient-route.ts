import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { IngredientController } from './ingredient-controller';
import {
  createIngredientRequestSchema,
  deleteBulkRequestSchema,
  updateIngredientRequestSchema
} from './ingredient-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(createIngredientRequestSchema.shape),
  asyncHandler(IngredientController.createIngredient)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(IngredientController.viewIngredients)
);

router.delete(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(deleteBulkRequestSchema.shape),
  asyncHandler(IngredientController.deleteBulk)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(IngredientController.viewIngredientDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(updateIngredientRequestSchema.shape),
  asyncHandler(IngredientController.updateIngredient)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(IngredientController.deleteIngredient)
);

export default router;
