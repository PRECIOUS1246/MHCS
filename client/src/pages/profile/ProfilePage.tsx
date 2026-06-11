import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ProfilePage = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', anonymousNickname: '', department: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/auth/profile').then((res) => {
      const d = res.data.data;
      setForm({ firstName: d.firstName, lastName: d.lastName, anonymousNickname: d.anonymousNickname || '', department: d.department || '' });
    });
  }, []);

  const save = async () => {
    const res = await api.patch('/auth/profile', form);
    if (accessToken) setAuth(res.data.data, accessToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card title="Profile Settings" className="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={user?.email || ''} disabled className="input-field mt-1 opacity-60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First name</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Last name</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Anonymous nickname</label>
          <input value={form.anonymousNickname} onChange={(e) => setForm({ ...form, anonymousNickname: e.target.value })} className="input-field mt-1" />
        </div>
        <Button onClick={save}>{saved ? 'Saved!' : 'Save Changes'}</Button>
      </div>
    </Card>
  );
};
