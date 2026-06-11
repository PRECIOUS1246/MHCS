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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset password</h1>
        {sent ? (
          <p className="text-slate-600">If an account exists, a reset link has been sent to your email.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Email" required />
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
        <Link to="/login" className="block mt-4 text-calm-600 text-sm hover:underline">Back to login</Link>
      </div>
    </div>
  );
};
