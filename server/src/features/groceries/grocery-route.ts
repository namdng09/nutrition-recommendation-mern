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
  addIngredientsRequestSchema,
  createGroceryRequestSchema,
  removeIngredientsRequestSchema,
  updateGroceryRequestSchema,
  updateIngredientInGrocerySchema
} from './grocery-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(createGroceryRequestSchema.shape),
  asyncHandler(GroceryController.createGrocery)
);

router.get(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(GroceryController.viewGroceries)
);

router.get(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(GroceryController.viewGroceryDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateGroceryRequestSchema.shape),
  asyncHandler(GroceryController.updateGrocery)
);

router.put(
  '/:id/ingredients',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(addIngredientsRequestSchema.shape),
  asyncHandler(GroceryController.addIngredientsInGrocery)
);

router.put(
  '/:groceryId/ingredients/:ingredientId',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(updateIngredientInGrocerySchema.shape),
  asyncHandler(GroceryController.updateIngredientInGrocery)
);

router.delete(
  '/:id/ingredients',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  parseFormData,
  validate(removeIngredientsRequestSchema.shape),
  asyncHandler(GroceryController.removeIngredientsInGrocery)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  asyncHandler(GroceryController.deleteGrocery)
);

export default router;
