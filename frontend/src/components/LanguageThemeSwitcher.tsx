import { useTranslation } from 'i18next-react';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface LanguageThemeSwitcherProps {
  className?: string;
}

export function LanguageThemeSwitcher({ className = '' }: LanguageThemeSwitcherProps) {
  const { i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);

    // Save to database if authenticated
    if (isAuthenticated) {
      try {
        await api.auth.updatePreferences(undefined, lang);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  const handleThemeChange = async () => {
    toggleTheme();
    const newTheme = isDark ? 'light' : 'dark';

    // Save to database if authenticated
    if (isAuthenticated) {
      try {
        await api.auth.updatePreferences(newTheme, undefined);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Language Switcher */}
      <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 rounded transition ${
            i18n.language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('bg')}
          className={`px-3 py-1 rounded transition ${
            i18n.language === 'bg'
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          БГ
        </button>
      </div>

      {/* Theme Switcher */}
      <button
        onClick={handleThemeChange}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? (
          <span className="text-lg">☀️</span>
        ) : (
          <span className="text-lg">🌙</span>
        )}
      </button>
    </div>
  );
}
