import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Appointment } from '../../types';

interface Counsellor {
  _id: string;
  firstName: string;
  lastName: string;
  department?: string;
}

export const AppointmentsPage = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [showBook, setShowBook] = useState(false);
  const [booking, setBooking] = useState({ counsellorId: '', scheduledDate: '', scheduledTime: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const endpoint = user?.role === 'counsellor' ? '/appointments/counsellor' : '/appointments/student';
      console.log(`Fetching appointments from ${endpoint}`, { userRole: user?.role });
      const res = await api.get(endpoint);
      console.log('Appointments loaded:', res.data.data);
      setAppointments(res.data.data);
      setError('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load appointments';
      console.error('Failed to load appointments:', err);
      setError(msg);
    }
  };

  useEffect(() => {
    load();
    if (user?.role === 'student') {
      api.get('/appointments/counsellors')
        .then((res) => {
          console.log('Counsellors loaded:', res.data.data);
          if (!res.data.data || res.data.data.length === 0) {
            console.warn('WARNING: No counsellors returned from API');
          }
          setCounsellors(res.data.data);
        })
        .catch((err) => console.error('Failed to load counsellors:', err));
    }
  }, [user?.role]);

  const book = async () => {
    console.log('Booking attempt:', { counsellorId: booking.counsellorId, scheduledDate: booking.scheduledDate, scheduledTime: booking.scheduledTime, reason: booking.reason });
    if (!booking.counsellorId || !booking.scheduledDate || !booking.scheduledTime) {
      setError('Please select a counsellor, date, and time');
      console.error('Validation failed:', { counsellorId: booking.counsellorId, scheduledDate: booking.scheduledDate, scheduledTime: booking.scheduledTime });
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const scheduledAt = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`).toISOString();
      const payload = { ...booking, scheduledAt };
      console.log('Sending payload:', payload);
      const res = await api.post('/appointments/book', payload);
      setShowBook(false);
      setBooking({ counsellorId: '', scheduledDate: '', scheduledTime: '', reason: '' });
      setSuccess('Appointment request submitted');
      try {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Appointment request submitted', type: 'success' } }));
      } catch (e) {}
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit booking';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'cancel') => {
    await api.patch(`/appointments/${id}/${action}`, action === 'reject' ? { reason: 'Schedule conflict' } : {});
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">Appointments</h1>
        {user?.role === 'student' && (
          <Button onClick={() => setShowBook(!showBook)}>Book Appointment</Button>
        )}
      </div>

      {error && <div className="rounded-xl p-4 bg-red-50 text-red-700">{error}</div>}

      {showBook && user?.role === 'student' && (
        <Card title="Book a Session">
          {console.log('RENDER: Booking form visible, current state:', booking)}
          <div className="space-y-4">
            <div className="text-xs bg-slate-100 p-2 rounded text-slate-600">
              DEBUG: counsellorId={booking.counsellorId || 'empty'} | date={booking.scheduledDate || 'empty'} | time={booking.scheduledTime || 'empty'}
            </div>
            <select value={booking.counsellorId} onChange={(e) => { console.log('Counsellor selected:', e.target.value); setBooking({ ...booking, counsellorId: e.target.value }); }} className="input-field">
              <option value="">Select counsellor</option>
              {counsellors.map((c) => (
                <option key={c._id} value={c._id}>{c.firstName} {c.lastName} — {c.department}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <input type="date" value={booking.scheduledDate} onChange={(e) => { console.log('Date changed:', e.target.value); setBooking({ ...booking, scheduledDate: e.target.value }); }} className="input-field mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <input type="time" value={booking.scheduledTime} onChange={(e) => { console.log('Time changed:', e.target.value); setBooking({ ...booking, scheduledTime: e.target.value }); }} className="input-field mt-1" />
              </div>
            </div>
            <textarea value={booking.reason} onChange={(e) => { console.log('Reason changed:', e.target.value); setBooking({ ...booking, reason: e.target.value }); }} className="input-field" placeholder="Reason (optional)" />
            <Button onClick={book} loading={loading}>Submit Request</Button>
            {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {appointments.map((apt) => (
          <Card key={apt._id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {user?.role === 'student'
                    ? `${apt.counsellorId?.firstName} ${apt.counsellorId?.lastName}`
                    : `${apt.studentId?.firstName} ${apt.studentId?.lastName}`}
                </p>
                <p className="text-sm text-slate-500">{new Date(apt.scheduledAt).toLocaleString()}</p>
                {apt.reason && <p className="text-sm mt-2 text-slate-600">{apt.reason}</p>}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                apt.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>{apt.status}</span>
            </div>
            {user?.role === 'counsellor' && apt.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <Button variant="primary" onClick={() => handleAction(apt._id, 'approve')}>Approve</Button>
                <Button variant="danger" onClick={() => handleAction(apt._id, 'reject')}>Reject</Button>
              </div>
            )}
            {apt.status === 'pending' && user?.role === 'student' && (
              <Button variant="ghost" className="mt-2" onClick={() => handleAction(apt._id, 'cancel')}>Cancel</Button>
            )}
          </Card>
        ))}
        {!appointments.length && <p className="text-slate-500 text-center py-8">No appointments yet</p>}
      </div>
    </div>
  );
};
