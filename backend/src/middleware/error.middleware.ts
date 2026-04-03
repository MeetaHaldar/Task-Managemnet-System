import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Cannot ${req.method} ${req.path}`, 404);
};

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[GlobalError] ${err.name}: ${err.message}`);

  // Prisma unique constraint
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'Database constraint violation', 409);
    return;
  }

  sendError(res, 'An unexpected error occurred. Please try again.', 500);
};
