import { useEffect, useState } from 'react';
import { Users, ClipboardList, AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const users = stats?.users as { total: number; students: number; counsellors: number };

  const statCards = [
    { icon: Users, label: 'Total Users', value: users?.total || 0, color: 'text-calm-600' },
    { icon: ClipboardList, label: 'Assessments', value: stats?.assessments || 0, color: 'text-lavender-600' },
    { icon: AlertTriangle, label: 'Critical Alerts', value: stats?.criticalAlerts || 0, color: 'text-red-600' },
    { icon: Calendar, label: 'Pending Appointments', value: stats?.pendingAppointments || 0, color: 'text-sage-600' },
    { icon: BookOpen, label: 'Resources', value: stats?.resources || 0, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Admin Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <Icon className={`w-8 h-8 ${color} mb-2`} />
            <p className="text-2xl font-bold">{value as number}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <Card title="User Breakdown">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{users?.students}</p><p className="text-sm text-slate-500">Students</p></div>
          <div><p className="text-2xl font-bold">{users?.counsellors}</p><p className="text-sm text-slate-500">Counsellors</p></div>
          <div><p className="text-2xl font-bold">{users?.total}</p><p className="text-sm text-slate-500">Total</p></div>
        </div>
      </Card>
    </div>
  );
};
