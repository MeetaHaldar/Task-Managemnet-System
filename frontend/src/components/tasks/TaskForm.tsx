'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const labelClass = 'block text-sm font-medium text-[var(--text-primary)] mb-1.5';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { createTask, updateTask, isSubmitting } = useTaskStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'PENDING',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    const ok = task ? await updateTask(task.id, payload) : await createTask(payload);
    if (ok) onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className={labelClass}>Task title *</label>
        <input
          {...register('title')}
          autoFocus
          placeholder="What needs to be done?"
          className={`input-base${errors.title ? ' error' : ''}`}
        />
        {errors.title && (
          <p className="text-xs text-[var(--danger)] font-medium mt-1">{errors.title.message}</p>
        )}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Add more details (optional)..."
          className="input-base"
        />
      </motion.div>

      {/* Status & Priority */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        <div>
          <label className={labelClass}>Status</label>
          <select {...register('status')} className="input-base">
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select {...register('priority')} className="input-base">
            <option value="LOW">↓ Low</option>
            <option value="MEDIUM">→ Medium</option>
            <option value="HIGH">↑ High</option>
          </select>
        </div>
      </motion.div>

      {/* Due date */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className={labelClass}>Due date</label>
        <input {...register('dueDate')} type="date" className="input-base" />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex justify-end gap-2.5 pt-1"
      >
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--bg-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {task ? 'Save changes' : 'Create task'}
        </button>
      </motion.div>
    </form>
  );
}
