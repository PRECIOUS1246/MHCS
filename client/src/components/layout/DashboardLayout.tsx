import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import ToastContainer from '../ui/Toast';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell relative flex h-screen min-h-screen overflow-hidden text-slate-800 dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb absolute -left-14 top-10 h-56 w-56 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="ambient-orb delay-1 absolute right-10 top-20 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="ambient-orb delay-2 absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-200/60 blur-3xl" />
      </div>

      <div className="hidden lg:block relative z-10 self-stretch">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onNavigate={() => setSidebarCollapsed(true)}
        />
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar
                onMobileClose={() => setMobileMenuOpen(false)}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <ToastContainer />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-3 lg:p-4">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
