import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Calendar, ClipboardList } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { riskColors } from '../../utils/riskColors';
import type { Alert, Appointment, Assessment } from '../../types';

export const CounsellorDashboard = () => {
  const [data, setData] = useState<{
    highRiskAlerts: Alert[];
    pendingAppointments: Appointment[];
    recentAssessments: Assessment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/counsellor-dashboard').then((res) => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Counsellor Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{data?.highRiskAlerts?.length || 0}</p>
              <p className="text-sm text-slate-500">Active High-Risk Alerts</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-calm-500">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-calm-500" />
            <div>
              <p className="text-2xl font-bold">{data?.pendingAppointments?.length || 0}</p>
              <p className="text-sm text-slate-500">Pending Appointments</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-lavender-500">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-lavender-500" />
            <div>
              <p className="text-2xl font-bold">{data?.recentAssessments?.length || 0}</p>
              <p className="text-sm text-slate-500">Recent High-Risk Assessments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="High-Risk Alerts" subtitle={<Link to="/alerts" className="text-calm-600 text-sm">View all →</Link>}>
          {data?.highRiskAlerts?.length ? (
            <ul className="space-y-3">
              {data.highRiskAlerts.map((alert) => (
                <li key={alert._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${riskColors[alert.riskLevel]}`}>
                      {alert.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No active alerts</p>
          )}
        </Card>

        <Card title="Pending Appointments">
          {data?.pendingAppointments?.length ? (
            <ul className="space-y-3">
              {data.pendingAppointments.map((apt) => (
                <li key={apt._id} className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-medium text-sm">
                      {apt.studentId?.firstName} {apt.studentId?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(apt.scheduledAt).toLocaleString()}</p>
                  </div>
                  <Link to="/appointments" className="text-calm-600 text-sm">Review</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No pending requests</p>
          )}
        </Card>

        <Card title="Review High-Risk Assessments" subtitle={<Link to="/assessments-review" className="text-calm-600 text-sm">Go to assessments →</Link>}>
          <p className="text-slate-500 text-sm">Open the assessments review page to see high-risk student submissions and details.</p>
        </Card>
      </div>
    </div>
  );
};
