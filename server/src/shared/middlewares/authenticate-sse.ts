import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { UserModel } from '~/shared/database/models/user-model';
import { verifyToken } from '~/shared/utils';

/**
 * SSE authentication middleware.
 * Authenticates using token from query string instead of Authorization header.
 * (SSE connections don't support custom headers, so we pass token as query param)
 */
export const authenticateSse = async (
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
