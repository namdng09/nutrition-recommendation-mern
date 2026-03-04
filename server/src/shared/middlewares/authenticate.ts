import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import passport from 'passport';

/**
 * JWT authentication middleware.
 * Option `required` allow that public routes can optionally personalize responses without requiring a login.
 *
 * - `required: true` (default) — no/invalid token → 401.
 * - `required: false` — valid token sets `req.user`; no token passes through
 *   with `req.user` undefined. Expired tokens still return 401 either way.
 */
export const authenticate = ({ required = true } = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'jwt',
      { session: false },
      (
        err: unknown,
        user: Express.User | false | null,
        info: JsonWebTokenError | TokenExpiredError | Error | undefined
      ) => {
        if (err) {
          return next(createHttpError(500, 'Passport authentication error'));
        }

        if (info instanceof TokenExpiredError) {
          return next(createHttpError(401, 'Token expired'));
        }

        if (!user) {
          if (!required) return next();
          return next(createHttpError(401, 'Unauthorized'));
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};
