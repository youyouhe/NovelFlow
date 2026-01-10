
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode, AccentColor } from './types';
import { THEME_COLORS } from './constants';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  colorClasses: typeof THEME_COLORS['blue'];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'novelflow_theme_mode';
const ACCENT_KEY = 'novelflow_theme_accent';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to system preference if no saved data
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACCENT_KEY);
      if (saved && Object.keys(THEME_COLORS).includes(saved)) {
        return saved as AccentColor;
      }
    }
    return 'blue';
  });

  // Sync with Tailwind class and LocalStorage
  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  const colorClasses = THEME_COLORS[accent];

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent, colorClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
