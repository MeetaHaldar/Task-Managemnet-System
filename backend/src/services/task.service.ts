import { TaskStatus, Priority, Prisma } from '.prisma/client';
import { CreateTaskBody, UpdateTaskBody } from '../schemas/task.schema';
import { TaskQueryParams, PaginationMeta } from '../types';
import { prisma } from '../lib/prisma';

class TaskServiceError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
};

const VALID_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'title',
  'dueDate',
  'priority',
] as const;

export class TaskService {
  async getTasks(
    userId: string,
    query: TaskQueryParams
  ): Promise<{ tasks: Prisma.TaskGetPayload<object>[]; meta: PaginationMeta }> {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '10', 10)));
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const sortBy = VALID_SORT_FIELDS.includes(
      query.sortBy as (typeof VALID_SORT_FIELDS)[number]
    )
      ? query.sortBy!
      : 'createdAt';

    const where: Prisma.TaskWhereInput = { userId };

    if (query.status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(query.status)) {
      where.status = query.status as TaskStatus;
    }
    if (query.priority && ['LOW', 'MEDIUM', 'HIGH'].includes(query.priority)) {
      where.priority = query.priority as Priority;
    }
    if (query.search?.trim()) {
      where.title = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    // Date range filter on dueDate
    if (query.month) {
      // "YYYY-MM" → filter entire month
      const [year, month] = query.month.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1); // exclusive
      where.dueDate = { gte: start, lt: end };
    } else if (query.dateFrom || query.dateTo) {
      const dueDateFilter: Prisma.DateTimeNullableFilter = {};
      if (query.dateFrom) dueDateFilter.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        dueDateFilter.lte = to;
      }
      where.dueDate = dueDateFilter;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getTaskById(id: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new TaskServiceError('Task not found', 'TASK_NOT_FOUND');
    return task;
  }

  async createTask(userId: string, data: CreateTaskBody) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'PENDING',
        priority: data.priority ?? 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });
  }

  async updateTask(id: string, userId: string, data: UpdateTaskBody) {
    await this.getTaskById(id, userId);
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
      },
    });
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    await this.getTaskById(id, userId);
    await prisma.task.delete({ where: { id } });
  }

  async toggleTask(id: string, userId: string) {
    const task = await this.getTaskById(id, userId);
    const nextStatus = STATUS_CYCLE[task.status];
    return prisma.task.update({
      where: { id },
      data: { status: nextStatus },
    });
  }
}
