'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const getApiError = (err: unknown): string => {
  const e = err as AxiosError<{ message?: string }>;
  return e.response?.data?.message ?? 'Something went wrong';
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = data.data as {
            user: User;
            accessToken: string;
            refreshToken: string;
          };
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name}! 👋`);
          return true;
        } catch (err) {
          set({ isLoading: false });
          toast.error(getApiError(err));
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = data.data as {
            user: User;
            accessToken: string;
            refreshToken: string;
          };
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome to TaskFlow, ${user.name}! 🎉`);
          return true;
        } catch (err) {
          set({ isLoading: false });
          toast.error(getApiError(err));
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // logout even if API fails
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
          toast.success('See you later! 👋');
        }
      },
    }),
    {
      name: 'taskflow-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
