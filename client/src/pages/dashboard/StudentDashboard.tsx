import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ClipboardList, Calendar, MessageCircle, Sparkles, PlayCircle, Wind, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import type { MoodRecord, Assessment, Appointment, Resource } from '../../types';

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<{
    recentMoods: MoodRecord[];
    moodAverage: number;
    recentAssessments: Assessment[];
    upcomingAppointments: Appointment[];
    unreadNotifications: number;
  } | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('Inhale');
  const [bubbles, setBubbles] = useState(Array.from({ length: 8 }, (_, index) => ({
    id: index,
    size: 42 + Math.random() * 28,
    left: 8 + Math.random() * 72,
    top: 18 + Math.random() * 50,
    delay: (index % 4) * 0.5 + Math.random() * 0.7,
  })));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/admin/student-dashboard'),
      api.get('/resources?limit=3'),
    ])
      .then(([dashboardRes, resourcesRes]) => {
        setData(dashboardRes.data.data);
        setResources(resourcesRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const phases: BreathingPhase[] = ['Inhale', 'Hold', 'Exhale'];
    let phaseIndex = 0;

    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setBreathingPhase(phases[phaseIndex]);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBestScore((current) => Math.max(current, score));
  }, [score]);

  if (loading) return <LoadingSpinner />;

  const chartData = data?.recentMoods?.map((m) => ({
    date: new Date(m.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: m.mood,
  })).reverse() || [];

  const quickActions = [
    { to: '/mood', icon: Heart, label: 'Log Mood', color: 'from-pink-400 via-rose-400 to-orange-300' },
    { to: '/assessment', icon: ClipboardList, label: 'Assessment', color: 'from-cyan-400 via-sky-500 to-blue-500' },
    { to: '/chat', icon: MessageCircle, label: 'Peer Chat', color: 'from-violet-400 via-purple-500 to-indigo-500' },
    { to: '/appointments', icon: Calendar, label: 'Book Session', color: 'from-emerald-400 via-teal-500 to-green-500' },
  ];

  const popBubble = (id: number) => {
    setScore((current) => current + 1);
    setBubbles((current) => current.map((bubble) =>
      bubble.id === id
        ? {
            ...bubble,
            size: 38 + Math.random() * 30,
            left: 10 + Math.random() * 70,
            top: 18 + Math.random() * 48,
            delay: Math.random() * 1.2,
          }
        : bubble,
    ));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] border border-white/40 bg-gradient-to-r from-white/80 via-calm-50/70 to-violet-50/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:from-slate-800/80 dark:via-slate-900/70 dark:to-slate-800/80 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.2),transparent_25%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-600 shadow-sm dark:bg-slate-800/80 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              Calm space
            </p>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-slate-800 dark:text-white">
              Hello, {user?.firstName} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
              How are you feeling today? Your wellbeing dashboard is ready with gentle support, reflection tools, and a calmer rhythm for the day.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-800/80">
            <div className="breathe-orb flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-white shadow-lg">
              <Wind className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Focus</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">{breathingPhase}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ scale: 1.03, y: -4 }} className={`glass-card p-4 bg-gradient-to-br ${color} text-white shadow-xl`}>
              <Icon className="mb-3 h-6 w-6" />
              <span className="text-sm font-semibold">{label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Mood Overview" subtitle={`Average: ${data?.moodAverage || 0}/10`} className="overflow-hidden">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-300">Start tracking your mood today</p>
          )}
        </Card>

        <Card title="Upcoming Appointments">
          {data?.upcomingAppointments?.length ? (
            <ul className="space-y-3">
              {data.upcomingAppointments.map((apt) => (
                <li key={apt._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{apt.counsellorId?.firstName} {apt.counsellorId?.lastName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{new Date(apt.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-calm-100 px-2 py-1 text-[10px] font-medium capitalize text-calm-700">{apt.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">No upcoming appointments</p>
          )}
        </Card>

        <Card title="Recent Assessments">
          {data?.recentAssessments?.length ? (
            <ul className="space-y-2">
              {data.recentAssessments.map((a) => (
                <li key={a._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-sm dark:bg-slate-800/50">
                  <span className="uppercase text-slate-700 dark:text-slate-200">{a.type}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    a.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    a.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{a.riskLevel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Link to="/assessment" className="text-sm font-medium text-calm-600 hover:underline">Take your first assessment →</Link>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card title="Sunset calm video" subtitle="A gentle moment to reset and breathe" className="p-0 overflow-hidden">
          <div className="relative">
            <video
              src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              className="h-64 w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-white/10" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur dark:bg-slate-900/60 dark:text-slate-100">
              <PlayCircle className="h-4 w-4 text-violet-500" />
              Relaxation session
            </div>
          </div>
        </Card>

        <Card title="Mini calming game" subtitle="Pop the glowing bubbles and reset your mind">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Score</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{score}</p>
            </div>
            <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
              Best {bestScore}
            </div>
          </div>

          <div className="relative h-56 overflow-hidden rounded-[24px] border border-violet-100 bg-gradient-to-br from-sky-100 via-violet-50 to-emerald-50 dark:border-violet-800 dark:from-slate-800 dark:via-violet-900/40 dark:to-slate-800">
            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                type="button"
                onClick={() => popBubble(bubble.id)}
                className="absolute rounded-full bg-white/70 shadow-[0_10px_25px_rgba(167,139,250,0.22)] transition-transform duration-300 hover:scale-110"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  left: `${bubble.left}%`,
                  top: `${bubble.top}%`,
                  animationDelay: `${bubble.delay}s`,
                }}
                aria-label="Pop bubble"
                title="Pop bubble"
              >
                <span className="block h-full w-full rounded-full bg-gradient-to-br from-cyan-200 via-violet-200 to-pink-200 opacity-90" />
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Trophy className="h-4 w-4 text-amber-500" />
              Calm streak
            </div>
            <button
              type="button"
              onClick={() => setScore(0)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Reset score
            </button>
          </div>
        </Card>
      </div>

      {resources.length > 0 && (
        <Card title="Recommended Resources" subtitle="Useful wellbeing content for students">
          <div className="space-y-3">
            {resources.map((resource) => (
              <Link key={resource._id} to="/resources" className="group block rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:border-calm-300 hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{resource.title}</h3>
                  <span className="rounded-full bg-calm-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-calm-700">{resource.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{resource.description}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {data?.unreadNotifications ? (
        <div className="rounded-2xl border border-calm-200 bg-calm-50/90 p-4 text-sm font-medium text-calm-700">
          You have {data.unreadNotifications} unread notification{data.unreadNotifications > 1 ? 's' : ''}.
          <Link to="/notifications" className="ml-2 text-calm-600 hover:underline">View all</Link>
        </div>
      ) : null}
    </div>
  );
};
