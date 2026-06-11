import { useEffect, useState } from 'react';

type ToastItem = { id: string; message: string; type?: 'success' | 'error' | 'info' };

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const show = (e: Event) => {
      const d = (e as CustomEvent).detail as { message: string; type?: ToastItem['type'] };
      if (!d?.message) return;
      const t: ToastItem = { id: String(Date.now()) + Math.random().toString(36).slice(2), message: d.message, type: d.type || 'info' };
      setToasts((s) => [t, ...s]);
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, 4000);
    };

    const notify = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const message = detail?.message || detail?.title || 'New notification';
      show(new CustomEvent('showToast', { detail: { message, type: 'info' } }));
    };

    window.addEventListener('showToast', show as EventListener);
    window.addEventListener('notificationReceived', notify as EventListener);
    return () => {
      window.removeEventListener('showToast', show as EventListener);
      window.removeEventListener('notificationReceived', notify as EventListener);
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-lg p-3 shadow-md max-w-sm text-sm ${t.type === 'success' ? 'bg-green-50 text-green-800' : t.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-900'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
