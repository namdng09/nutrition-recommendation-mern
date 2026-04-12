import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import { authenticate, authorize, validate } from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { DishController } from './dish-controller';
import {
  createDishRequestSchema,
  createPrivateDishRequestSchema,
  deleteBulkRequestSchema,
  updateDishRequestSchema,
  updatePrivateDishRequestSchema
} from './dish-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(createDishRequestSchema.shape),
  asyncHandler(DishController.createDish)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(DishController.viewDishes)
);

router.delete(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(deleteBulkRequestSchema.shape),
  asyncHandler(DishController.deleteBulk)
);

router.post(
  '/private',
  authenticate(),
  authorize([ROLE.USER]),
  handleSingleImageUpload('image'),
  validate(createPrivateDishRequestSchema.shape),
  asyncHandler(DishController.createPrivateDish)
);

router.get(
  '/private',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(DishController.viewPrivateDishes)
);

router.get(
  '/private/:id',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(DishController.viewPrivateDishDetail)
);

router.put(
  '/private/:id',
  authenticate(),
  authorize([ROLE.USER]),
  handleSingleImageUpload('image'),
  validate(updatePrivateDishRequestSchema.shape),
  asyncHandler(DishController.updatePrivateDish)
);

router.delete(
  '/private/:id',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(DishController.deletePrivateDish)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(DishController.viewDishDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
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
