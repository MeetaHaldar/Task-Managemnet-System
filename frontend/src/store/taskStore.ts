'use client';
import { create } from 'zustand';
import { Task, TaskFilters, PaginationMeta } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface TaskStore {
  tasks: Task[];
  meta: PaginationMeta | null;
  filters: TaskFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<boolean>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<boolean>;
  setFilters: (partial: Partial<TaskFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
  dateFrom: '',
  dateTo: '',
  month: '',
};

const getErr = (err: unknown): string => {
  const e = err as AxiosError<{ message?: string }>;
  return e.response?.data?.message ?? 'Something went wrong';
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  meta: null,
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,
  isSubmitting: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const f = get().filters;
      const params = new URLSearchParams();
      params.set('page', String(f.page));
      params.set('limit', String(f.limit));
      params.set('sortBy', f.sortBy);
      params.set('sortOrder', f.sortOrder);
      if (f.search) params.set('search', f.search);
      if (f.status) params.set('status', f.status);
      if (f.priority) params.set('priority', f.priority);
      if (f.dateFrom) params.set('dateFrom', f.dateFrom);
      if (f.dateTo) params.set('dateTo', f.dateTo);
      if (f.month) params.set('month', f.month);
      const { data } = await api.get(`/tasks?${params.toString()}`);
      set({ tasks: data.data as Task[], meta: data.meta as PaginationMeta });
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isSubmitting: true });
    try {
      const { data } = await api.post('/tasks', taskData);
      toast.success('Task created ✅');
      get().fetchTasks();
      return true;
    } catch (err) {
      toast.error(getErr(err));
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateTask: async (id, taskData) => {
    set({ isSubmitting: true });
    try {
      const { data } = await api.patch(`/tasks/${id}`, taskData);
      const updated = data.data as Task;
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
      toast.success('Task updated ✏️');
      return true;
    } catch (err) {
      toast.error(getErr(err));
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      toast.success('Task deleted 🗑️');
      return true;
    } catch (err) {
      toast.error(getErr(err));
      return false;
    }
  },

  toggleTask: async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      const updated = data.data as Task;
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
      toast.success('Status updated!');
      return true;
    } catch (err) {
      toast.error(getErr(err));
      return false;
    }
  },

  setFilters: (partial) => {
    set((s) => ({
      filters: {
        ...s.filters,
        ...partial,
        page: 'page' in partial ? (partial.page ?? 1) : 1,
      },
    }));
    get().fetchTasks();
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
    get().fetchTasks();
  },
}));
