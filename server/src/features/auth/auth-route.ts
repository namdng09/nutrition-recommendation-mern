import { Router } from 'express';
import passport from 'passport';

import { parseFormData, validate, validateQuery } from '~/shared/middlewares';
import { createOAuthCallback } from '~/shared/middlewares/oauth-callback';
import { asyncHandler, handleSignUpUpload } from '~/shared/utils';

import { AuthController } from './auth-controller';
import {
  forgotPasswordRequestSchema,
  loginRequestSchema,
  resetPasswordQuerySchema,
  resetPasswordRequestSchema,
  signUpRequestSchema
} from './auth-dto';

const router = Router();

router.post(
  '/login',
  parseFormData,
  validate(loginRequestSchema.shape),
  asyncHandler(AuthController.login)
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/google/callback',
  createOAuthCallback('google'),
  AuthController.loginWithProvider
);

router.post(
  '/sign-up',
  handleSignUpUpload(),
  validate(signUpRequestSchema.shape),
  asyncHandler(AuthController.signUp)
);

router.post('/logout', asyncHandler(AuthController.logout));

router.post(
  '/refresh-access-token',
  asyncHandler(AuthController.refreshAccessToken)
);

router.post(
  '/forgot-password',
  parseFormData,
  validate(forgotPasswordRequestSchema.shape),
  asyncHandler(AuthController.forgotPassword)
);

router.post(
  '/reset-password',
  validateQuery(resetPasswordQuerySchema.shape),
  parseFormData,
  validate(resetPasswordRequestSchema.shape),
  asyncHandler(AuthController.resetPassword)
);

export default router;
