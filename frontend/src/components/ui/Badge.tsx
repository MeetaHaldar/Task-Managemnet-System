import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@/types';

// Using inline styles for colors so they work reliably in both light and dark mode
// without depending on Tailwind JIT scanning dynamic class names.

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; dotColor: string; bgLight: string; bgDark: string; textLight: string; textDark: string }
> = {
  PENDING: {
    label: 'Pending',
    dotColor: '#F59E0B',
    bgLight: '#FEF3C7',
    bgDark: 'rgba(245,158,11,0.15)',
    textLight: '#92400E',
    textDark: '#FCD34D',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dotColor: '#3B82F6',
    bgLight: '#DBEAFE',
    bgDark: 'rgba(59,130,246,0.15)',
    textLight: '#1E40AF',
    textDark: '#93C5FD',
  },
  COMPLETED: {
    label: 'Completed',
    dotColor: '#22C55E',
    bgLight: '#DCFCE7',
    bgDark: 'rgba(34,197,94,0.15)',
    textLight: '#166534',
    textDark: '#86EFAC',
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; icon: string; bgLight: string; bgDark: string; textLight: string; textDark: string }
> = {
  LOW: {
    label: 'Low',
    icon: '↓',
    bgLight: '#F3F4F6',
    bgDark: 'rgba(255,255,255,0.07)',
    textLight: '#4B5563',
    textDark: '#9CA3AF',
  },
  MEDIUM: {
    label: 'Medium',
    icon: '→',
    bgLight: '#FEF3C7',
    bgDark: 'rgba(245,158,11,0.15)',
    textLight: '#92400E',
    textDark: '#FCD34D',
  },
  HIGH: {
    label: 'High',
    icon: '↑',
    bgLight: '#FEE2E2',
    bgDark: 'rgba(239,68,68,0.15)',
    textLight: '#991B1B',
    textDark: '#FCA5A5',
  },
};

// Detect dark mode via CSS variable trick — read computed style
function useIsDark() {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  const dark = useIsDark();
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: dark ? cfg.bgDark : cfg.bgLight,
        color: dark ? cfg.textDark : cfg.textLight,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dotColor }}
      />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  const dark = useIsDark();
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{
        background: dark ? cfg.bgDark : cfg.bgLight,
        color: dark ? cfg.textDark : cfg.textLight,
      }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
