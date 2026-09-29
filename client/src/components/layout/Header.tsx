import { Moon, Sun, LogOut, Menu, User } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/student/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#221b31]/85 backdrop-blur border-b border-violet-100 dark:border-[#433759] px-4 py-3 shadow-[0_8px_20px_rgba(91,70,140,0.06)]">
      <div className="flex items-center justify-between">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-white/5">
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-white/5" aria-label="Toggle theme">
            {isDark ? <Sun className="w-5 h-5 text-violet-100" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label="View profile"
          >
            <User className="w-4 h-4 text-violet-600 dark:text-violet-200" />
            <span className="text-sm font-medium hidden sm:inline text-slate-700 dark:text-slate-100">{user?.firstName}</span>
            <span className="text-xs text-slate-500 dark:text-slate-300 capitalize hidden md:inline">({user?.role})</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600" aria-label="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
