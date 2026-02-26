import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { z, ZodType } from 'zod';

const formatZodErrors = (errors: z.ZodError['issues']): string => {
  return errors.map(error => error.message).join(', ');
};

/**
 * Generic middleware to validate request body fields using Zod.
 * @param fields - An object mapping field names to Zod schemas.
 */
export const validate = (fields: Record<string, ZodType<any>>) => {
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
export const validateQuery = (fields: Record<string, ZodType<any>>) => {
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
