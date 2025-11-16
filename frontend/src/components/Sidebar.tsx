import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useLayout } from '../contexts/LayoutContext';
import { LanguageThemeSwitcher } from './LanguageThemeSwitcher';

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useLayout();

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  const handleNavClick = () => {
    closeSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-30 md:relative md:top-auto md:h-auto md:flex md:flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full md:h-auto p-4 md:p-4 space-y-4">
          {/* Navigation - Always visible for logged in users */}
          {user && user.emailVerified && (
            <>
              <nav className="space-y-2">
                <Link
                  to="/"
                  onClick={handleNavClick}
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
                >
                  {t('navigation.dashboard')}
                </Link>
                {user.role === 'SUPERADMIN' && (
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
                  >
                    {t('navigation.admin')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleNavClick();
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium text-left"
                >
                  ↪ Начало
                </button>
              </nav>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700" />
            </>
          )}

          {/* Language/Theme Switcher */}
          <div>
            <LanguageThemeSwitcher />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Auth Section */}
          <div className="space-y-2">
            {user && user.emailVerified ? (
              <>
                <div className="px-3 py-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t('common.appName')}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {user.name}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition border border-red-200 dark:border-red-800"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="block px-3 py-2 text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-center transition"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="block px-3 py-2 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-center"
                >
                  {t('auth.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
