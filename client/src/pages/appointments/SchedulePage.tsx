import { useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SchedulePage = () => {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [slots, setSlots] = useState([{ startTime: '09:00', endTime: '12:00' }]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.post('/appointments/availability', { dayOfWeek, slots });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Manage Schedule</h1>
      <Card title="Weekly Availability">
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="input-field mb-4">
          {DAYS.map((day, i) => <option key={day} value={i}>{day}</option>)}
        </select>
        {slots.map((slot, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="time" value={slot.startTime} onChange={(e) => {
              const s = [...slots]; s[i].startTime = e.target.value; setSlots(s);
            }} className="input-field" />
            <input type="time" value={slot.endTime} onChange={(e) => {
              const s = [...slots]; s[i].endTime = e.target.value; setSlots(s);
            }} className="input-field" />
          </div>
        ))}
        <Button variant="secondary" className="mb-4" onClick={() => setSlots([...slots, { startTime: '14:00', endTime: '17:00' }])}>
          Add Time Slot
        </Button>
        <Button onClick={save} loading={loading}>{saved ? 'Saved!' : 'Save Availability'}</Button>
      </Card>
    </div>
  );
};
