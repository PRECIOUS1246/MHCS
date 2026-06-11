import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ClipboardList, Calendar, MessageCircle, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import type { MoodRecord, Assessment, Appointment, Resource } from '../../types';

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

  if (loading) return <LoadingSpinner />;

  const chartData = data?.recentMoods?.map((m) => ({
    date: new Date(m.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    mood: m.mood,
  })).reverse() || [];

  const quickActions = [
    { to: '/mood', icon: Heart, label: 'Log Mood', color: 'from-pink-400 to-rose-400' },
    { to: '/assessment', icon: ClipboardList, label: 'Assessment', color: 'from-calm-400 to-blue-400' },
    { to: '/chat', icon: MessageCircle, label: 'Peer Chat', color: 'from-lavender-400 to-purple-400' },
    { to: '/appointments', icon: Calendar, label: 'Book Session', color: 'from-sage-400 to-green-400' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white">
          Hello, {user?.firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1">How are you feeling today? We're here for you.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ scale: 1.02 }} className={`glass-card p-4 bg-gradient-to-br ${color} text-white`}>
              <Icon className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">{label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Mood Overview" subtitle={`Average: ${data?.moodAverage || 0}/10`}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">Start tracking your mood today</p>
          )}
        </Card>

        <Card title="Upcoming Appointments">
          {data?.upcomingAppointments?.length ? (
            <ul className="space-y-3">
              {data.upcomingAppointments.map((apt) => (
                <li key={apt._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-medium text-sm">{apt.counsellorId?.firstName} {apt.counsellorId?.lastName}</p>
                    <p className="text-xs text-slate-500">{new Date(apt.scheduledAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-calm-100 text-calm-700 capitalize">{apt.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No upcoming appointments</p>
          )}
        </Card>

        <Card title="Recent Assessments">
          {data?.recentAssessments?.length ? (
            <ul className="space-y-2">
              {data.recentAssessments.map((a) => (
                <li key={a._id} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm uppercase">{a.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    a.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    a.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{a.riskLevel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Link to="/assessment" className="text-calm-600 text-sm hover:underline">Take your first assessment →</Link>
          )}
        </Card>
      </div>

      {resources.length > 0 && (
        <Card title="Recommended Resources" subtitle="Useful wellbeing content for students">
          <div className="space-y-3">
            {resources.map((resource) => (
              <Link key={resource._id} to="/resources" className="group block rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition hover:border-calm-300 hover:bg-slate-50 dark:hover:bg-slate-800/70">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{resource.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-calm-100 text-calm-700 capitalize">{resource.type}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{resource.description}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {data?.unreadNotifications ? (
        <div className="p-4 rounded-xl bg-calm-50 dark:bg-calm-900/20 border border-calm-200 dark:border-calm-800">
          You have {data.unreadNotifications} unread notification{data.unreadNotifications > 1 ? 's' : ''}.
          <Link to="/notifications" className="ml-2 text-calm-600 font-medium hover:underline">View all</Link>
        </div>
      ) : null}
    </div>
  );
};
