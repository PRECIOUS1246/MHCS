import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';

const schema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    email: z.string().trim().email('Enter a valid email'),
    studentId: z.string().trim().min(3, 'Student ID is required'),
    department: z.string().trim().min(2, 'Department is required'),
    level: z.string().trim().min(1, 'Level is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', data);
      navigate('/student/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md glass-card p-8">
        <h1 className="mb-2 text-2xl font-display font-bold text-slate-900 dark:text-white">Create a student account</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">Register as a student to access assessments, mood tracking, and support resources.</p>
        {error && <div className="mb-4 rounded-xl bg-red-50/90 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full name</label>
            <input {...register('fullName')} className="input-field mt-1" />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input {...register('email')} type="email" className="input-field mt-1" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Student ID</label>
              <input {...register('studentId')} className="input-field mt-1" />
              {errors.studentId && <p className="mt-1 text-xs text-red-500">{errors.studentId.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Level</label>
              <input {...register('level')} className="input-field mt-1" placeholder="100" />
              {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Department</label>
            <input {...register('department')} className="input-field mt-1" />
            {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input {...register('password')} type="password" className="input-field mt-1" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm password</label>
            <input {...register('confirmPassword')} type="password" className="input-field mt-1" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" loading={loading} className="w-full">Register</Button>
          <p className="text-center text-sm text-slate-700 dark:text-slate-200">
            Have an account? <Link to="/student/login" className="text-calm-600 hover:underline dark:text-calm-300">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
