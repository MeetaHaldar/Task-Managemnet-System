'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Calendar } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';

// Generate last 12 months for the month picker
function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') });
  }
  return options;
}

const MONTH_OPTIONS = getMonthOptions();

export function TaskFilters() {
  const { filters, setFilters, resetFilters } = useTaskStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasFilters =
    filters.status || filters.priority || filters.search ||
    filters.dateFrom || filters.dateTo || filters.month;

  const handleMonthChange = (month: string) => {
    // When month is selected, clear dateFrom/dateTo
    setFilters({ month, dateFrom: '', dateTo: '' });
  };

  const handleDateFromChange = (dateFrom: string) => {
    // When date range is used, clear month
    setFilters({ dateFrom, month: '' });
  };

  const handleDateToChange = (dateTo: string) => {
    setFilters({ dateTo, month: '' });
  };

  return (
    <div className="space-y-2.5">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks…"
            className={`input-base input-icon-left${searchInput ? ' input-icon-right' : ''}`}
          />
          <AnimatePresence>
            {searchInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className={`relative flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium border transition-colors ${
            open
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {hasFilters && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-base)]" />
          )}
        </button>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--bg-overlay)] border border-[var(--border)] rounded-xl space-y-4">
              {/* Row 1: Status, Priority, Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ status: e.target.value as '' })}
                    className="input-base h-8 text-sm py-0"
                  >
                    <option value="">All status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ priority: e.target.value as '' })}
                    className="input-base h-8 text-sm py-0"
                  >
                    <option value="">All priority</option>
                    <option value="HIGH">↑ High</option>
                    <option value="MEDIUM">→ Medium</option>
                    <option value="LOW">↓ Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Sort by</label>
                  <select
                    value={`${filters.sortBy}:${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split(':');
                      setFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                    }}
                    className="input-base h-8 text-sm py-0"
                  >
                    <option value="createdAt:desc">Newest first</option>
                    <option value="createdAt:asc">Oldest first</option>
                    <option value="dueDate:asc">Due date (earliest)</option>
                    <option value="dueDate:desc">Due date (latest)</option>
                    <option value="title:asc">Title A → Z</option>
                    <option value="priority:desc">Priority (high → low)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date filters */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Date filters
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Month picker */}
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">By month</label>
                    <select
                      value={filters.month}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="input-base h-8 text-sm py-0"
                    >
                      <option value="">Any month</option>
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date from */}
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Due from</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleDateFromChange(e.target.value)}
                      className="input-base h-8 text-sm py-0"
                    />
                  </div>

                  {/* Date to */}
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Due to</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleDateToChange(e.target.value)}
                      className="input-base h-8 text-sm py-0"
                    />
                  </div>
                </div>
              </div>

              {/* Clear all */}
              <AnimatePresence>
                {hasFilters && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-end">
                    <button
                      onClick={() => { resetFilters(); setSearchInput(''); setOpen(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
