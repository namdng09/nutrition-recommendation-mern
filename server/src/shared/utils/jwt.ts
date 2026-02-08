import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

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
    expiresIn: '1h'
  });
};

export const verifyToken = (
  token: string,
  secret: string
): string | JwtPayload => {
  try {
    return jwt.verify(token, secret) as string | JwtPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createHttpError(401, 'Token expired');
    }
    throw new Error(error instanceof Error ? error.message : 'Invalid token');
  }
};
