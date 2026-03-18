import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import isHttpError from 'http-errors';

import { ApiResponse } from '~/shared/utils';

export const errorHandler: ErrorRequestHandler = (
  err: isHttpError.HttpError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = isHttpError.isHttpError(err) ? err.status : 500;

  // Only clear the refresh token cookie when the refresh token itself expires,
  // NOT when the access token expires (client should use refresh token to renew it).
  if (err instanceof Error && err.message === 'Refresh token expired') {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.SERVER_URL?.startsWith('https'),
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none'
    });
  }
  if (status >= 400 && status < 500) {
    const message = err.message || 'Client Error';
    res.status(status).json(ApiResponse.failed(message));
    return;
  }

  const message =
    process.env.NODE_ENV === 'production' && err instanceof Error
      ? 'Internal Server Error'
      : err.message;

  console.error(err);

  res.status(500).json(ApiResponse.error(message));
};
