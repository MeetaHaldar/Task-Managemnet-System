import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape, ZodError } from 'zod';
import { sendError } from '../utils/response.utils';

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const field = String(issue.path[issue.path.length - 1] ?? 'general');
          if (!errors[field]) errors[field] = [];
          errors[field].push(issue.message);
        }
        sendError(res, 'Validation failed', 400, errors);
        return;
      }
      next(err);
    }
  };
