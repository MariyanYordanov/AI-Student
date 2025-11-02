import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('errors.errorOccurred'));
        return;
      }

      try {
        const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(t('auth.verificationSent'));
          setEmail(data.email);
          // NO auto-redirect - user manually clicks login button
        } else {
          setStatus('error');
          setMessage(data.error || t('auth.errors.genericError'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('auth.errors.networkError'));
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`rounded-xl shadow-lg p-8 max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('auth.emailVerification')}
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {t('auth.checkEmail')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {message}
            </h1>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('auth.checkEmail')} <span className="font-semibold">{email}</span>
            </p>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('auth.emailVerification')}
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              {t('auth.login')}
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('errors.errorOccurred')}
            </h1>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>
            <div className="space-y-3">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('auth.errors.serverError')}
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
              >
                {t('auth.login')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
