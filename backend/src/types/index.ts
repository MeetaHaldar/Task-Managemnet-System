import { Request } from 'express';

// JWT payload shape
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extended request type with user from JWT
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Pagination meta returned in list responses
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

// Query params for GET /tasks
export interface TaskQueryParams {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;  // ISO date string — filter dueDate >= dateFrom
  dateTo?: string;    // ISO date string — filter dueDate <= dateTo
  month?: string;     // "YYYY-MM" — filter dueDate within that month
}
