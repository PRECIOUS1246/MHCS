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
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-display font-bold">Mood Tracker</h1>

      <Card className="overflow-hidden border-0 bg-[#5a5469] text-white shadow-[0_20px_40px_rgba(65,56,81,0.2)]">
        <div className="rounded-[24px] bg-[#5a5469] p-2 sm:p-4">
          <div className="mb-6 text-4xl font-semibold tracking-tight text-white/90">How are you feeling right now?</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3 md:gap-4 mb-6">
            {MOOD_EMOJIS.map(({ value, emoji, label }) => (
              <button
                key={value}
                onClick={() => setSelectedMood(value)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-4 transition-all duration-200 ${
                  selectedMood === value
                    ? 'border-[#9ab0ff] bg-[#7d86c8] text-white shadow-[0_10px_20px_rgba(122,136,200,0.4)] scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-100'
                }`}
              >
                <span className="text-4xl leading-none">{emoji}</span>
                <span className="mt-2 text-center text-xs sm:text-sm font-medium text-current/90">{label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional journal note..."
            className="w-full rounded-2xl border border-white/10 bg-[#3a3847] px-4 py-4 text-base text-white placeholder:text-slate-300/80 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/40 mb-4 min-h-[90px]"
            maxLength={2000}
          />
          <Button onClick={handleSubmit} loading={loading} disabled={!selectedMood} className="bg-[#89a4ff] hover:bg-[#7b96f5] text-white">Log Mood</Button>
        </div>
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
