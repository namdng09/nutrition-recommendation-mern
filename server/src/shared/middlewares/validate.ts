import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';

const formatZodErrors = (errors: z.ZodError['issues']): string => {
  const seen = new Set<string>();
  return errors
    .filter(error => {
      const key = error.path.join('.');
      for (const seenKey of seen) {
        if (key === seenKey || key.startsWith(seenKey + '.')) return false;
      }
      seen.add(key);
      return true;
    })
    .map(error => {
      const path = error.path.length > 0 ? error.path.join('.') : null;
      return path ? `${path}: ${error.message}` : error.message;
    })
    .join(', ');
};

/**
 * Generic middleware to validate request body fields using Zod.
 * @param fields - An object mapping field names to Zod schemas.
 */
export const validate = (fields: z.ZodRawShape) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object(fields);
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error.issues);
      return next(createHttpError(400, formattedErrors));
    }
    req.body = result.data;
    next();
  };
};

/**
 * Generic middleware to validate request query parameters using Zod.
 * @param fields - An object mapping query param names to Zod schemas.
 */
export const validateQuery = (fields: z.ZodRawShape) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const schema = z.object(fields);
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error.issues);
      return next(createHttpError(400, formattedErrors));
    }
    next();
  };
};
