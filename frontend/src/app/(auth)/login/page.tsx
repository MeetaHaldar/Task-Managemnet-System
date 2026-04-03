'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckSquare2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [shake, setShake] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const ok = await login(data.email, data.password);
    if (ok) router.replace('/dashboard');
    else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--bg-base)]">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 blur-3xl opacity-70"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30 blur-3xl opacity-70"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-lg shadow-blue-300/30 dark:shadow-blue-900/40">
            <CheckSquare2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sign in to TaskFlow</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Good to have you back.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            animate={shake ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-1.5"
            >
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-base input-icon-left${errors.email ? ' error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--danger)] font-medium">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
              className="space-y-1.5"
            >
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-base input-icon-left input-icon-right${errors.password ? ' error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] z-10"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[var(--danger)] font-medium">{errors.password.message}</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="pt-1"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>

        <motion.p
          className="text-center text-sm text-[var(--text-secondary)] mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[var(--accent)] font-medium hover:underline underline-offset-4"
          >
            Create one
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
