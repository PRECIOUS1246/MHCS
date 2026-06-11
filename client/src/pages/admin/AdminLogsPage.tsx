import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';

interface Log {
  _id: string;
  action: string;
  entity: string;
  createdAt: string;
  userId?: { email: string };
}

export const AdminLogsPage = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    api.get('/admin/activity-logs').then((res) => setLogs(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Activity Logs</h1>
      <Card>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log._id} className="flex justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
              <div>
                <span className="font-medium">{log.action}</span>
                <span className="text-slate-500 ml-2">on {log.entity}</span>
                {log.userId && <span className="text-slate-400 ml-2">by {log.userId.email}</span>}
              </div>
              <span className="text-slate-400 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
