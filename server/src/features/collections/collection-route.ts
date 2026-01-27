import { Router } from 'express';

import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler, handleSingleImageUpload } from '~/shared/utils';
import { ROLE } from '~/shared/constants/role';

import { CollectionController } from './collection-controller';
import {
  addDishToCollectionRequestSchema,
  createCollectionRequestSchema,
  removeDishFromCollectionRequestSchema,
  updateCollectionRequestSchema
} from './collection-dto';

const router = Router();

// Create a new collection
router.post(
  '/',
  authenticate(),
  handleSingleImageUpload('image'),
  validate(createCollectionRequestSchema.shape),
  asyncHandler(CollectionController.createCollection)
);

// Get all public collections
router.get('/', asyncHandler(CollectionController.viewCollections));

// Get my collections
router.get(
  '/me',
  authenticate(),
  asyncHandler(CollectionController.viewMyCollections)
);

// Delete multiple collections
router.delete(
  '/',
  authenticate(),
  asyncHandler(CollectionController.deleteBulk)
);

// Get collection detail
router.get('/:id', asyncHandler(CollectionController.viewCollectionDetail));

// Update collection
router.put(
  '/:id',
  authenticate(),
  handleSingleImageUpload('image'),
  validate(updateCollectionRequestSchema.shape),
  asyncHandler(CollectionController.updateCollection)
);

// Delete collection
router.delete(
  '/:id',
  authenticate(),
  asyncHandler(CollectionController.deleteCollection)
);

// Add dish to collection
router.post(
  '/:id/dishes',
  authenticate(),
  parseFormData,
  validate(addDishToCollectionRequestSchema.shape),
  asyncHandler(CollectionController.addDishToCollection)
);

// Remove dish from collection
router.delete(
  '/:id/dishes',
  authenticate(),
  parseFormData,
  validate(removeDishFromCollectionRequestSchema.shape),
  asyncHandler(CollectionController.removeDishFromCollection)
);

// Follow collection
router.post(
  '/:id/follow',
  authenticate(),
  asyncHandler(CollectionController.followCollection)
);

// Unfollow collection
router.delete(
  '/:id/follow',
  authenticate(),
  asyncHandler(CollectionController.unfollowCollection)
);

export default router;
