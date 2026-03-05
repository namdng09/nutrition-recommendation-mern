import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';

import { CollectionController } from './collection-controller';
import {
  addDishToCollectionRequestSchema,
  createCollectionRequestSchema,
  deleteBulkCollectionRequestSchema,
  removeDishFromCollectionRequestSchema,
  updateCollectionRequestSchema
} from './collection-dto';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(createCollectionRequestSchema.shape),
  asyncHandler(CollectionController.createCollection)
);

router.get(
  '/',
  authenticate({ required: false }),
  asyncHandler(CollectionController.viewCollections)
);

router.delete(
  '/',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  validate(deleteBulkCollectionRequestSchema.shape),
  asyncHandler(CollectionController.deleteBulk)
);

router.get(
  '/:id',
  authenticate({ required: false }),
  asyncHandler(CollectionController.viewCollectionDetail)
);

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  handleSingleImageUpload('image'),
  validate(updateCollectionRequestSchema.shape),
  asyncHandler(CollectionController.updateCollection)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(CollectionController.deleteCollection)
);

router.post(
  '/:id/dishes',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(addDishToCollectionRequestSchema.shape),
  asyncHandler(CollectionController.addDishToCollection)
);

router.delete(
  '/:id/dishes',
  authenticate(),
  authorize([ROLE.NUTRITIONIST]),
  parseFormData,
  validate(removeDishFromCollectionRequestSchema.shape),
  asyncHandler(CollectionController.removeDishFromCollection)
);

export default router;
