import { Link } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const { toggleSidebar } = useLayout();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Menu Toggle Button (Mobile) */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              Aily
            </Link>
          </div>

          {/* Right side - Mobile Logout Button */}
          {user && user.emailVerified && (
            <button
              onClick={handleLogout}
              className="md:hidden px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition border border-red-200 dark:border-red-800"
            >
              {t('common.logout')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
