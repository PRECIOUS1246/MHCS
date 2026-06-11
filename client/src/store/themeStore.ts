import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((state) => {
          const isDark = !state.isDark;
          document.documentElement.classList.toggle('dark', isDark);
          return { isDark };
        }),
    }),
    { name: 'mhcs-theme' }
  )
);

// Apply theme on load
const stored = localStorage.getItem('mhcs-theme');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.isDark) document.documentElement.classList.add('dark');
  } catch { /* ignore */ }
}
