import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['student', 'counsellor', 'admin']).default('student'),
  studentId: z.string().optional(),
  department: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 to-lavender-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md glass-card p-8">
        <h1 className="text-2xl font-display font-bold mb-6">Create your account</h1>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input {...register('firstName')} className="input-field mt-1" />
              {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input {...register('lastName')} className="input-field mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select {...register('role')} className="input-field mt-1">
              <option value="student">Student</option>
              <option value="counsellor">Counsellor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {selectedRole === 'student' && (
            <div>
              <label className="text-sm font-medium">Student ID (optional)</label>
              <input {...register('studentId')} className="input-field mt-1" />
            </div>
          )}
          {selectedRole === 'counsellor' && (
            <div>
              <label className="text-sm font-medium">Department (optional)</label>
              <input {...register('department')} className="input-field mt-1" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input {...register('password')} type="password" className="input-field mt-1" />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>
          <Button type="submit" loading={loading} className="w-full">Register</Button>
          <p className="text-center text-sm text-slate-500">
            Have an account? <Link to="/login" className="text-calm-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
