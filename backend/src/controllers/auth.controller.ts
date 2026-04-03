import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AuthenticatedRequest } from '../types';

const svc = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await svc.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    const e = err as { code?: string; message: string };
    if (e.code === 'EMAIL_EXISTS') {
      sendError(res, e.message, 409);
      return;
    }
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await svc.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    const e = err as { code?: string; message: string };
    if (e.code === 'INVALID_CREDENTIALS') {
      sendError(res, e.message, 401);
      return;
    }
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }
    const tokens = await svc.refresh(refreshToken);
    sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (err) {
    const e = err as { code?: string; message: string };
    if (e.code === 'INVALID_REFRESH_TOKEN') {
      sendError(res, e.message, 401);
      return;
    }
    next(err);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await svc.logout(req.user!.userId);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};
