import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      next(new ValidationError(message));
      return;
    }

    const { body, query, params } = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    if (body) req.body = body;
    if (query) req.query = query as Request['query'];
    if (params) req.params = params as Request['params'];

    next();
  };
};
