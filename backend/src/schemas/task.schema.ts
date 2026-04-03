import { z } from 'zod';

const TASK_STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const TASK_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must be under 200 characters'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be under 1000 characters')
      .optional(),
    status: z.enum(TASK_STATUS).optional().default('PENDING'),
    priority: z.enum(TASK_PRIORITY).optional().default('MEDIUM'),
    dueDate: z
      .string()
      .datetime({ offset: true, message: 'dueDate must be a valid ISO 8601 datetime' })
      .optional()
      .nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(1000).optional().nullable(),
      status: z.enum(TASK_STATUS).optional(),
      priority: z.enum(TASK_PRIORITY).optional(),
      dueDate: z.string().datetime({ offset: true }).optional().nullable(),
    })
    .strict(),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>['body'];
