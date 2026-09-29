import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required').optional(),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', data);

      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-calm-400 to-lavender-500 shadow-lg shadow-violet-500/30">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white drop-shadow-sm">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-100/90">Your safe space for mental wellness</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-5">
          {error && <div className="rounded-xl bg-red-50/90 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@university.edu" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-calm-600 hover:underline dark:text-calm-300">Forgot password?</Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
          <p className="text-center text-sm text-slate-700 dark:text-slate-200">
            New here? <Link to="/student/register" className="font-medium text-calm-600 hover:underline dark:text-calm-300">Create account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
