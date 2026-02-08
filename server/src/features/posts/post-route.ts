import { Router } from 'express';

import { ROLE } from '~/shared/constants/role';
import {
  authenticate,
  authorize,
  parseFormData,
  validate
} from '~/shared/middlewares';
import { asyncHandler, handleMultipleImagesUpload } from '~/shared/utils';

import { PostController } from './post-controller';
import {
  createCommentRequestSchema,
  createPostRequestSchema,
  updatePostRequestSchema
} from './post-dto';

const router = Router();

// Post CRUD operations
router.post(
  '/',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleMultipleImagesUpload('images', 5), // Max 5 images
  validate(createPostRequestSchema.shape),
  asyncHandler(PostController.createPost)
);

router.get('/', asyncHandler(PostController.viewPosts));

router.get('/:id', asyncHandler(PostController.viewPostDetail));

router.get('/slug/:slug', asyncHandler(PostController.viewPostBySlug));

router.put(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  handleMultipleImagesUpload('images', 5), // Max 5 images
  validate(updatePostRequestSchema.shape),
  asyncHandler(PostController.updatePost)
);

router.delete(
  '/:id',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(PostController.deletePost)
);

// Like/Unlike post
router.post(
  '/:id/like',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(PostController.likePost)
);

// Comment operations
router.post(
  '/:id/comments',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  parseFormData,
  validate(createCommentRequestSchema.shape),
  asyncHandler(PostController.addComment)
);

router.delete(
  '/:id/comments/:commentId',
  authenticate(),
  authorize([ROLE.USER, ROLE.NUTRITIONIST, ROLE.ADMIN]),
  asyncHandler(PostController.deleteComment)
);

export default router;
