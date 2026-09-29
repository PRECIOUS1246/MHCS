import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Heart, ClipboardList, MessageCircle, Users,
  Calendar, BookOpen, Bell, AlertTriangle, Settings, Shield, X, User, Gamepad2, PanelLeftClose, PanelLeftOpen
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
  { to: '/game', icon: Gamepad2, label: 'Game' },
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

interface SidebarProps {
  collapsed?: boolean;
  onMobileClose?: () => void;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export const Sidebar = ({ collapsed = false, onMobileClose, onToggleCollapse, onNavigate }: SidebarProps) => {
  const { user } = useAuthStore();
  const links = [
    { to: '/profile', icon: User, label: 'Profile' },
    ...(user?.role === 'admin'
      ? adminLinks
      : user?.role === 'counsellor'
        ? counsellorLinks
        : studentLinks),
  ];

  return (
    <aside className={`sticky top-0 flex h-screen flex-col overflow-hidden border-r border-violet-200/80 bg-[#f4eefb] p-4 text-slate-700 shadow-[0_0_30px_rgba(76,29,149,0.08)] transition-all duration-300 dark:border-[#433759] dark:bg-[#221b31] dark:text-slate-100 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-6 flex items-center justify-between gap-2 px-2 py-4">
        <div className={`flex items-center gap-2 ${collapsed ? 'w-full justify-center' : ''}`}>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-slate-800 dark:text-white">MHCS</h1>
              <p className="text-xs text-violet-600 dark:text-violet-200/80">Mental Health Care</p>
            </div>
          )}
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 hover:bg-violet-100 lg:hidden dark:hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-slate-700 dark:text-white" />
          </button>
        )}
      </div>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mb-4 hidden items-center justify-center rounded-xl border border-violet-200 bg-white/70 p-2 text-violet-700 transition hover:bg-violet-100 lg:flex dark:border-violet-700 dark:bg-[#2a213c] dark:text-violet-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              onMobileClose?.();
              onNavigate?.();
            }}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center rounded-xl transition-all ${collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'} ${
                isActive
                  ? 'bg-violet-100 text-violet-900 shadow-sm shadow-violet-200/80 dark:bg-[#5e4d8a] dark:text-white'
                  : 'text-slate-600 hover:bg-violet-50 hover:text-violet-900 dark:text-violet-100/80 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-medium">{label}</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
