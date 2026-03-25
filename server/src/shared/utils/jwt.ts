import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { TOKEN_TYPE, type TokenType } from '~/shared/constants/token-type';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required but not configured'
  );
}

if (!JWT_REFRESH_SECRET) {
  throw new Error(
    'JWT_REFRESH_SECRET environment variable is required but not configured'
  );
}

if (!JWT_RESET_PASSWORD_SECRET) {
  throw new Error(
    'JWT_RESET_PASSWORD_SECRET environment variable is required but not configured'
  );
}

type JwtPayload = {
  id: string | number;
  role?: string;
  hasOnboarded?: boolean;
};

export const generateToken = (
  payload: JwtPayload
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m'
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
  return { accessToken, refreshToken };
};

export const generateResetPasswordToken = (id: string): string => {
  return jwt.sign({ id }, JWT_RESET_PASSWORD_SECRET, {
    expiresIn: '15m'
  });
};

/**
 * Verify a JWT token and return its payload.
 * @param token - The JWT token string
 * @param secret - The secret key used to sign the token
 * @param tokenType - The type of token ('access', 'refresh', 'resetPassword')
 *                    Determines the expiry error message for proper error handling.
 *                    Defaults to 'access'.
 */
export const verifyToken = (
  token: string,
  secret: string,
  tokenType: TokenType = TOKEN_TYPE.ACCESS
): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      if (tokenType === TOKEN_TYPE.REFRESH) {
        throw createHttpError(401, 'Refresh token expired');
      }
      if (tokenType === TOKEN_TYPE.RESET_PASSWORD) {
        throw createHttpError(401, 'Reset password token expired');
      }
      throw createHttpError(401, 'Token expired');
    }
    throw createHttpError(401, 'Invalid token');
  }
};
