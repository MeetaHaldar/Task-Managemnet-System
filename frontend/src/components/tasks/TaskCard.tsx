'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Calendar, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { useTaskStore } from '@/store/taskStore';
import { formatDueDate, cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, index, onEdit }: TaskCardProps) {
  const { toggleTask, deleteTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCompleted = task.status === 'COMPLETED';
  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleTask(task.id);
    setIsToggling(false);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    await deleteTask(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.97 }}
      transition={{
        layout: { duration: 0.25 },
        default: { delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      whileHover={{ y: confirmDelete ? 0 : -1, boxShadow: confirmDelete ? undefined : 'var(--shadow-md)' }}
      className={cn(
        'card group relative p-4 overflow-hidden',
        isCompleted && 'opacity-60',
        dueInfo?.isOverdue && !isCompleted && 'border-red-200 dark:border-red-900/50'
      )}
    >
      {/* Completed top bar */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--success)] rounded-t-2xl origin-left"
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirmation overlay ─────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 flex items-center justify-between gap-3 px-4 rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--danger)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--danger-soft)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                Delete &ldquo;<span className="font-semibold">{task.title}</span>&rdquo;?
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: 'var(--danger)' }}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main card content ───────────────────────────── */}
      <div className="flex items-start gap-3.5">
        {/* Toggle button */}
        <motion.button
          onClick={handleToggle}
          disabled={isToggling}
          whileTap={{ scale: 0.85 }}
          className="flex-shrink-0 mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-full"
          aria-label="Toggle status"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCompleted ? (
              <motion.div key="done" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
              </motion.div>
            ) : task.status === 'IN_PROGRESS' ? (
              <motion.div key="progress" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                <Circle className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--accent)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className={cn(
              'font-semibold text-sm text-[var(--text-primary)] leading-snug flex-1 min-w-0',
              isCompleted && 'line-through text-[var(--text-muted)]'
            )}>
              {task.title}
            </h3>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-soft)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                aria-label="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-soft)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-[var(--text-secondary)] mb-2.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {dueInfo && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{
                  color: dueInfo.isOverdue && !isCompleted
                    ? 'var(--danger)'
                    : dueInfo.isUrgent && !isCompleted
                    ? 'var(--warning)'
                    : 'var(--text-muted)',
                }}
              >
                <Calendar className="w-3 h-3" />
                {dueInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
