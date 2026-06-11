import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MOOD_EMOJIS } from '../../data/assessments';
import type { MoodRecord } from '../../types';

export const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [analytics, setAnalytics] = useState<{ records: MoodRecord[]; average: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = () => {
    api.get('/moods/analytics').then((res) => setAnalytics(res.data.data));
  };

  useEffect(() => { loadAnalytics(); }, []);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setLoading(true);
    const emoji = MOOD_EMOJIS.find((m) => m.value === selectedMood)?.emoji || '😐';
    try {
      await api.post('/moods', { mood: selectedMood, emoji, note });
      setSelectedMood(null);
      setNote('');
      loadAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const chartData = analytics?.records?.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: r.mood,
    emoji: r.emoji,
  })) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-display font-bold">Mood Tracker</h1>

      <Card title="How are you feeling right now?">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
          {MOOD_EMOJIS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => setSelectedMood(value)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                selectedMood === value ? 'bg-calm-100 dark:bg-calm-900/30 ring-2 ring-calm-500 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs mt-1 text-slate-500 hidden md:block">{label}</span>
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional journal note..."
          className="input-field mb-4 min-h-[80px]"
          maxLength={2000}
        />
        <Button onClick={handleSubmit} loading={loading} disabled={!selectedMood}>Log Mood</Button>
      </Card>

      <Card title="Your Emotional Trends" subtitle={`30-day average: ${analytics?.average || 0}/10`}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#7a8f63" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-8">No mood data yet. Log your first mood above!</p>
        )}
      </Card>
    </div>
  );
};
