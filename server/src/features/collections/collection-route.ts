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

router.get('/', asyncHandler(CollectionController.viewCollections));

router.get('/:id', asyncHandler(CollectionController.viewCollectionDetail));

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
  authorize([ROLE.NUTRITIONIST]),
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

router.post(
  '/:id/follow',
  authenticate(),
  asyncHandler(CollectionController.followCollection)
);

router.delete(
  '/:id/follow',
  authenticate(),
  asyncHandler(CollectionController.unfollowCollection)
);

export default router;
