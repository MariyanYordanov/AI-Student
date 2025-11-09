import { useEffect, useState } from 'react';

// Helper to get initial theme
function getInitialTheme(): boolean {
  // Check localStorage first
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';

  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Apply theme to document immediately (before React renders)
function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const theme = getInitialTheme();
    // Apply theme IMMEDIATELY on mount
    applyTheme(theme);
    return theme;
  });

  useEffect(() => {
    // Update when isDark changes
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return { isDark, toggleTheme };
};
