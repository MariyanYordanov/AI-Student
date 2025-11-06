import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LanguageThemeSwitcher } from './LanguageThemeSwitcher';

export function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            Aily
          </Link>

          {/* Center Navigation */}
          {user && user.emailVerified && (
            <div className="hidden md:flex gap-8">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                {t('navigation.dashboard')}
              </Link>
              {user.role === 'SUPERADMIN' && (
                <Link
                  to="/admin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                >
                  {t('navigation.admin')}
                </Link>
              )}
            </div>
          )}

          {/* Right side - Language/Theme/Auth */}
          <div className="flex items-center gap-4">
            <LanguageThemeSwitcher />

            {user && user.emailVerified ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
                >
                  {t('auth.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
