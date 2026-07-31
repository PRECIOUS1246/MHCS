import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';

interface CreateUserForm {
  fullName: string;
  email: string;
  role: 'counsellor' | 'admin';
  department: string;
  password: string;
  confirmPassword: string;
}

interface UserRow {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CreateUserForm>({
    fullName: '',
    email: '',
    role: 'counsellor',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/admin/users?search=${search}`).then((res) => setUsers(res.data.data));
  }, [search]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/users/${id}`, { isActive: !isActive });
    api.get(`/admin/users?search=${search}`).then((res) => setUsers(res.data.data));
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    try {
      await api.post('/admin/users', form);
      setFormSuccess('Account created successfully.');
      setForm({ fullName: '', email: '', role: 'counsellor', department: '', password: '', confirmPassword: '' });
      api.get(`/admin/users?search=${search}`).then((res) => setUsers(res.data.data));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Unable to create the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">User Management</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-md" placeholder="Search users..." />
      <Card>
        <h2 className="text-lg font-semibold mb-4">Create counsellor or admin account</h2>
        {formError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{formError}</div>}
        {formSuccess && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">{formSuccess}</div>}
        <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" placeholder="Full name" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="Email" type="email" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'counsellor' | 'admin' })} className="input-field">
            <option value="counsellor">Counsellor</option>
            <option value="admin">Admin</option>
          </select>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" placeholder="Department (optional)" />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Password" type="password" required />
          <input value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" placeholder="Confirm password" type="password" required />
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="rounded-xl bg-calm-600 px-4 py-2 text-white disabled:opacity-60">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Role</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-2">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2 capitalize">{u.role}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleActive(u._id, u.isActive)} className="text-calm-600 hover:underline text-xs">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
