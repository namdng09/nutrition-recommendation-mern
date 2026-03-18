import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import createHttpError from 'http-errors';

import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models/user-model';
import { authenticate, authorize } from '~/shared/middlewares';
import { asyncHandler, verifyToken } from '~/shared/utils';

import { AchievementController } from './achievement-controller';

const router = Router();

const authenticateSse = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.query.token;
    if (typeof token !== 'string' || token.length === 0) {
      throw createHttpError(401, 'Unauthorized');
    }

    const payload = verifyToken(token, process.env.JWT_SECRET!);
    if (typeof payload === 'string') {
      throw createHttpError(401, 'Unauthorized');
    }

    const userId = payload.id;
    if (typeof userId !== 'string' && typeof userId !== 'number') {
      throw createHttpError(401, 'Unauthorized');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw createHttpError(401, 'Unauthorized');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Public — anyone can browse achievement definitions
router.get('/', asyncHandler(AchievementController.getAllDefinitions));

router.get('/sse', authenticateSse, AchievementController.subscribe);

router.get(
  '/me',
  authenticate(),
  authorize([ROLE.USER]),
  asyncHandler(AchievementController.getUserAchievements)
);

export default router;
