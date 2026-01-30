import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { IngredientController } from './ingredient-controller';
import {
  createIngredientRequestSchema,
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

router.get('/', asyncHandler(IngredientController.viewIngredients));

router.get('/:id', asyncHandler(IngredientController.viewIngredientDetail));

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
  authorize([ROLE.NUTRITIONIST]),
  asyncHandler(IngredientController.deleteIngredient)
);

export default router;
