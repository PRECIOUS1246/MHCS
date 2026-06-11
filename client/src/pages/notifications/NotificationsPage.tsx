import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Notification } from '../../types';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    api.get('/notifications').then((res) => {
      setNotifications(res.data.data);
      setUnread(res.data.unreadCount);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Notification;
      if (!detail) return;
      setNotifications((prev) => [detail, ...prev]);
      setUnread((u) => u + 1);
    };
    window.addEventListener('notificationReceived', handler as EventListener);
    return () => window.removeEventListener('notificationReceived', handler as EventListener);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    load();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">Notifications</h1>
        {unread > 0 && <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>}
      </div>
      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n._id} className={!n.isRead ? 'border-l-4 border-l-calm-500' : ''}>
            <div className="flex justify-between">
              <h3 className="font-medium">{n.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                n.type === 'alert' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>{n.type}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">{n.message}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
          </Card>
        ))}
        {!notifications.length && <p className="text-slate-500 text-center py-8">No notifications</p>}
      </div>
    </div>
  );
};
