import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';

import { GroceryController } from './grocery-controller';
import {
  addGroceryIngredientRequestSchema,
  createGroceryRequestSchema,
  removeGroceryIngredientRequestSchema,
  updateGroceryIngredientRequestSchema,
  updateGroceryRequestSchema
} from './grocery-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(createGroceryRequestSchema.shape),
  asyncHandler(GroceryController.createGrocery)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(GroceryController.viewGroceries)
);

// Not used
router.get(
  '/:id',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(GroceryController.viewGroceryDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(updateGroceryRequestSchema.shape),
  asyncHandler(GroceryController.updateGrocery)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(GroceryController.deleteGrocery)
);

router.post(
  '/:id/ingredients',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(addGroceryIngredientRequestSchema.shape),
  asyncHandler(GroceryController.addIngredientsInGrocery)
);

router.put(
  '/:id/ingredients/:ingredientId',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(updateGroceryIngredientRequestSchema.shape),
  asyncHandler(GroceryController.updateIngredientInGrocery)
);

router.delete(
  '/:id/ingredients',
  authenticate(),
  authorize([ROLE.USER]),
  parseFormData,
  validate(removeGroceryIngredientRequestSchema.shape),
  asyncHandler(GroceryController.removeIngredientsInGrocery)
);

export default router;
