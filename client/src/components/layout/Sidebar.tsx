import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Heart, ClipboardList, MessageCircle, Users,
  Calendar, BookOpen, Bell, AlertTriangle, Settings, Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessment', icon: ClipboardList, label: 'Assessment' },
  { to: '/mood', icon: Heart, label: 'Mood Tracker' },
  { to: '/chat', icon: MessageCircle, label: 'Peer Chat' },
  { to: '/forums', icon: Users, label: 'Forums' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/resources', icon: BookOpen, label: 'Resources' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const counsellorLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/assessments-review', icon: ClipboardList, label: 'Assessments' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/schedule', icon: Settings, label: 'Schedule' },
];

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/resources', icon: BookOpen, label: 'Resources' },
  { to: '/forums', icon: MessageCircle, label: 'Forums' },
  { to: '/admin/logs', icon: Shield, label: 'Activity Logs' },
];

export const Sidebar = () => {
  const { user } = useAuthStore();
  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'counsellor' ? counsellorLinks : studentLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white/80 dark:bg-slate-900/80 backdrop-blur border-r border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-calm-400 to-lavender-500 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-slate-800 dark:text-white">MHCS</h1>
          <p className="text-xs text-slate-500">Mental Health Care</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-calm-100 dark:bg-calm-900/30 text-calm-700 dark:text-calm-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
