import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { DishController } from './dish-controller';
import { createDishRequestSchema, updateDishRequestSchema } from './dish-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(createDishRequestSchema.shape),
  asyncHandler(DishController.createDish)
);

router.get('/', asyncHandler(DishController.viewDishes));

router.get(
  '/:id/detail-nutrition',
  asyncHandler(DishController.viewDishDetailNutrition)
);

router.get('/:id', asyncHandler(DishController.viewDishDetail));

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleSingleImageUpload('image'),
  validate(updateDishRequestSchema.shape),
  asyncHandler(DishController.updateDish)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(DishController.deleteDish)
);

export default router;
