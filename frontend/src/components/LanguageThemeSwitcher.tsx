import { useTranslation } from 'i18next-react';
import { useTheme } from '../hooks/useTheme';

interface LanguageThemeSwitcherProps {
  className?: string;
}

export function LanguageThemeSwitcher({ className = '' }: LanguageThemeSwitcherProps) {
  const { i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
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
        onClick={toggleTheme}
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
