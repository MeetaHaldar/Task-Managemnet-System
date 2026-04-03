'use client';
import { AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskSkeletonList } from './TaskSkeleton';
import { EmptyState } from './EmptyState';
import { useTaskStore } from '@/store/taskStore';

interface TaskListProps {
  onEdit: (task: Task) => void;
  onCreateTask: () => void;
}

export function TaskList({ onEdit, onCreateTask }: TaskListProps) {
  const { tasks, isLoading, filters, resetFilters } = useTaskStore();
  const hasFilters = !!(filters.search || filters.status || filters.priority || filters.dateFrom || filters.dateTo || filters.month);

  if (isLoading) return <TaskSkeletonList count={5} />;

  if (tasks.length === 0) {
    return (
      <EmptyState
        isFiltered={hasFilters}
        onCreateTask={onCreateTask}
        onClearFilters={resetFilters}
      />
    );
  }

  // Completed tasks always sink to the bottom
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
    if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
    return 0;
  });

  return (
    <div className="space-y-2.5">
      <AnimatePresence mode="popLayout" initial={false}>
        {sorted.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} onEdit={onEdit} />
        ))}
      </AnimatePresence>
    </div>
  );
}
