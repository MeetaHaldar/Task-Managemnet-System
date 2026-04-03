'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, CheckCircle2, Timer, AlertTriangle, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { Task } from '@/types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  icon: Icon, label, value, color, delay = 0,
}: {
  icon: React.ElementType; label: string; value: number;
  color: 'blue' | 'green' | 'amber' | 'red'; delay?: number;
}) {
  const colorMap = {
    blue: { icon: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    green: { icon: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
    amber: { icon: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    red: { icon: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' },
  };
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      className="card p-4 cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{value}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { tasks, meta, filters, fetchTasks, setFilters } = useTaskStore();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
  ).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {getGreeting()},{' '}
            <span className="text-[var(--accent)]">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {meta?.total === 0
              ? 'Nothing on the list yet.'
              : `You have ${meta?.total ?? tasks.length} task${(meta?.total ?? 0) !== 1 ? 's' : ''} in total.`}
          </p>
        </motion.div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          <StatCard icon={LayoutGrid} label="Total" value={meta?.total ?? tasks.length} color="blue" delay={0.05} />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} color="green" delay={0.1} />
          <StatCard icon={Timer} label="In Progress" value={inProgress} color="amber" delay={0.15} />
          <StatCard icon={AlertTriangle} label="Overdue" value={overdue} color="red" delay={0.2} />
        </div>

        {/* Analytics charts — toggled */}
        <AnimatePresence initial={false}>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <AnalyticsCharts tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task panel */}
        <motion.div
          className="card overflow-hidden"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Toolbar */}
          <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-[var(--text-primary)]">
                Tasks
                {meta && (
                  <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({meta.total})</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnalytics((v) => !v)}
                  title={showAnalytics ? 'Hide analytics' : 'Show analytics'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors"
                  style={showAnalytics ? {
                    background: 'var(--accent-soft)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  } : {
                    background: 'var(--bg-overlay)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add task
                </button>
              </div>
            </div>
            <TaskFilters />
          </div>

          {/* List */}
          <div className="p-5">
            <TaskList onEdit={(task) => setEditTask(task)} onCreateTask={() => setCreateOpen(true)} />
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                Page <span className="font-semibold text-[var(--text-secondary)]">{meta.page}</span> of{' '}
                <span className="font-semibold text-[var(--text-secondary)]">{meta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={!meta.hasPrevPage}
                  onClick={() => setFilters({ page: filters.page - 1 })}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium bg-[var(--bg-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setFilters({ page: filters.page + 1 })}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium bg-[var(--bg-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New task" description="Add a new task to your list.">
        <TaskForm onClose={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit task" description="Update the details of this task.">
        {editTask && <TaskForm task={editTask} onClose={() => setEditTask(null)} />}
      </Modal>
    </div>
  );
}
