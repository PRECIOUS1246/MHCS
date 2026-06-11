import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';

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

  useEffect(() => {
    api.get(`/admin/users?search=${search}`).then((res) => setUsers(res.data.data));
  }, [search]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/users/${id}`, { isActive: !isActive });
    api.get(`/admin/users?search=${search}`).then((res) => setUsers(res.data.data));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">User Management</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-md" placeholder="Search users..." />
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
