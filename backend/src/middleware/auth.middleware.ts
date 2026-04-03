import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';
import { AuthenticatedRequest } from '../types';

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    const token = header.split(' ')[1];
    if (!token) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    req.user = verifyAccessToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token. Please log in again.', 401);
  }
};
