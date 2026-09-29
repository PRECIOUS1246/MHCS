import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Reset password</h1>
        {sent ? (
          <p className="text-slate-700 dark:text-slate-200">If an account exists, a reset link has been sent to your email.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Email" required />
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
        <Link to="/student/login" className="mt-4 block text-sm text-calm-600 hover:underline dark:text-calm-300">Back to login</Link>
      </div>
    </div>
  );
};
