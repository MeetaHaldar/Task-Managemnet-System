import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AuthenticatedRequest, TaskQueryParams } from '../types';

const svc = new TaskService();

const isNotFound = (err: unknown) =>
  (err as { code?: string }).code === 'TASK_NOT_FOUND';

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tasks, meta } = await svc.getTasks(
      req.user!.userId,
      req.query as TaskQueryParams
    );
    sendSuccess(res, tasks, 'Tasks retrieved successfully', 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await svc.getTaskById(String(req.params.id), req.user!.userId);
    sendSuccess(res, task, 'Task retrieved');
  } catch (err) {
    if (isNotFound(err)) {
      sendError(res, 'Task not found', 404);
      return;
    }
    next(err);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await svc.createTask(req.user!.userId, req.body);
    sendSuccess(res, task, 'Task created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await svc.updateTask(String(req.params.id), req.user!.userId, req.body);
    sendSuccess(res, task, 'Task updated successfully');
  } catch (err) {
    if (isNotFound(err)) {
      sendError(res, 'Task not found', 404);
      return;
    }
    next(err);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await svc.deleteTask(String(req.params.id), req.user!.userId);
    sendSuccess(res, null, 'Task deleted successfully');
  } catch (err) {
    if (isNotFound(err)) {
      sendError(res, 'Task not found', 404);
      return;
    }
    next(err);
  }
};

export const toggleTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await svc.toggleTask(String(req.params.id), req.user!.userId);
    sendSuccess(res, task, 'Task status toggled');
  } catch (err) {
    if (isNotFound(err)) {
      sendError(res, 'Task not found', 404);
      return;
    }
    next(err);
  }
};
