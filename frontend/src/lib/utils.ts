import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(dateStr: string): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  const date = parseISO(dateStr);
  const overdue = isPast(date) && !isToday(date);
  const urgent = isToday(date) || isTomorrow(date);
  let label: string;
  if (isToday(date)) label = 'Today';
  else if (isTomorrow(date)) label = 'Tomorrow';
  else if (overdue) label = `Overdue · ${format(date, 'MMM d')}`;
  else label = format(date, 'MMM d, yyyy');
  return { label, isOverdue: overdue, isUrgent: urgent };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}
