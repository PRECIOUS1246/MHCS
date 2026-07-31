import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
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
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const payload = otpStep ? { email: data.email, otp } : data;
      const res = await api.post('/auth/login', payload);

      if (res.data.requiresOtp) {
        setOtpStep(true);
        setInfo(res.data.message || 'Enter the verification code sent to your email.');
        if (res.data.previewUrl) {
          setPreviewUrl(res.data.previewUrl);
        }
        return;
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 via-white to-lavender-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-calm-400 to-lavender-500 mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Welcome back</h1>
          <p className="text-slate-500 mt-2">Your safe space for mental wellness</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}
          {info && <div className="p-3 rounded-xl bg-calm-50 dark:bg-calm-900/20 text-calm-700 dark:text-calm-300 text-sm">{info}</div>}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@university.edu" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          {!otpStep && (
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input {...register('password')} type="password" className="input-field" />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
          )}
          {otpStep && (
            <div>
              <label className="block text-sm font-medium mb-2">Verification code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                className="input-field"
                placeholder="Enter 6-digit code"
              />
            </div>
          )}
          {previewUrl && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 text-sm">
              Preview OTP email: <a href={previewUrl} target="_blank" rel="noreferrer" className="underline">open email</a>
            </div>
          )}
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-calm-600 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">{otpStep ? 'Verify code' : 'Sign in'}</Button>
          <p className="text-center text-sm text-slate-500">
            New here? <Link to="/student/register" className="text-calm-600 font-medium hover:underline">Create account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
