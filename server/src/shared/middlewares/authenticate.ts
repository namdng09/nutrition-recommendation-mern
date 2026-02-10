import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import passport from 'passport';

export const authenticate = () => {
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
          return next(createHttpError(401, 'Unauthorized'));
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};
