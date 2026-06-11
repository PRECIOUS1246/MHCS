import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { riskColors } from '../../utils/riskColors';
import type { Alert } from '../../types';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/alerts?resolved=false').then((res) => setAlerts(res.data.data));
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string | undefined) => {
    if (!id) {
      setError('Alert ID missing');
      return;
    }
    setResolvingId(id);
    setError('');
    try {
      const response = await api.patch(`/alerts/${id}/resolve`);
      console.log('Alert resolved:', response.data);
      load();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to resolve alert';
      console.error('Failed to resolve alert:', err);
      setError(errorMsg);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-display font-bold">Risk Alerts</h1>
      {error && <div className="rounded-xl p-4 bg-red-50 text-red-700">{error}</div>}
      {alerts.map((alert) => {
        const alertId = alert._id || alert.id;
        return (
          <Card key={alertId || alert.message}>
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${riskColors[alert.riskLevel]}`}>
                  {alert.riskLevel}
                </span>
                <p className="mt-2 font-medium break-words">{alert.message}</p>
                {alert.userId && (
                  <p className="text-sm text-slate-500 mt-1">
                    Student: {alert.userId.firstName} {alert.userId.lastName}
                    {alert.userId.email ? ` (${alert.userId.email})` : ''}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
              <Button
                type="button"
                className="cursor-pointer"
                variant="secondary"
                onClick={() => resolve(alertId)}
                loading={resolvingId === alertId}
                disabled={resolvingId === alertId}
              >
                Resolve
              </Button>
            </div>
          </Card>
        );
      })}
      {!alerts.length && <p className="text-slate-500 text-center py-8">No active alerts</p>}
    </div>
  );
};
