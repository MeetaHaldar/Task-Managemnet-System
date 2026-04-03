'use client';
import { motion } from 'framer-motion';
import { Inbox, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  isFiltered?: boolean;
  onCreateTask?: () => void;
  onClearFilters?: () => void;
}

export function EmptyState({ isFiltered, onCreateTask, onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        className="w-14 h-14 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border)] flex items-center justify-center mb-5"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {isFiltered ? <Search className="w-6 h-6 text-[var(--text-muted)]" /> : <Inbox className="w-6 h-6 text-[var(--text-muted)]" />}
      </motion.div>
      <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5">
        {isFiltered ? 'No tasks match your filters' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-[220px] mb-5">
        {isFiltered ? 'Try adjusting your search or filter settings.' : 'Create your first task and start getting things done.'}
      </p>
      {isFiltered ? (
        <button onClick={onClearFilters}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--bg-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
          Clear filters
        </button>
      ) : (
        <button onClick={onCreateTask}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          <Plus className="w-4 h-4" /> Create first task
        </button>
      )}
    </motion.div>
  );
}
