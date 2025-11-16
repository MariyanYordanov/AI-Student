import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {t('landing.subtitle')}
          </h2>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          {t('landing.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {t('landing.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition"
          >
            {t('landing.cta')}
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-lg transition"
          >
            {t('landing.login')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={isDark ? 'py-20 bg-gray-800' : 'py-20 bg-gray-50'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">{t('landing.features')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className={isDark ? 'bg-gray-700 rounded-lg shadow-lg p-8' : 'bg-white rounded-lg shadow-lg p-8'}>
              <h3 className="text-xl font-bold mb-3">{t('landing.feature1Title')}</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {t('landing.feature1Desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className={isDark ? 'bg-gray-700 rounded-lg shadow-lg p-8' : 'bg-white rounded-lg shadow-lg p-8'}>
              <h3 className="text-xl font-bold mb-3">{t('landing.feature2Title')}</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {t('landing.feature2Desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className={isDark ? 'bg-gray-700 rounded-lg shadow-lg p-8' : 'bg-white rounded-lg shadow-lg p-8'}>
              <h3 className="text-xl font-bold mb-3">{t('landing.feature3Title')}</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {t('landing.feature3Desc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className={isDark ? 'bg-gray-700 rounded-lg shadow-lg p-8' : 'bg-white rounded-lg shadow-lg p-8'}>
              <h3 className="text-xl font-bold mb-3">{t('landing.feature4Title')}</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                {t('landing.feature4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Aily Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">{t('landing.aboutAily')}</h2>

        <div className="max-w-3xl mx-auto">
          <div className={isDark ? 'bg-gray-800 rounded-lg p-8 mb-8' : 'bg-gray-50 rounded-lg p-8 mb-8'}>
            <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('landing.ailyDescription1')}
            </p>
            <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('landing.ailyDescription2')}
            </p>
          </div>

          {/* Why Teach Aily */}
          <div className={isDark ? 'bg-gray-800 rounded-lg p-8' : 'bg-gray-50 rounded-lg p-8'}>
            <h3 className="text-2xl font-bold mb-6">{t('landing.whyTeachAily')}</h3>
            <ul className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex gap-4">
                <span>{t('landing.benefit1')}</span>
              </li>
              <li className="flex gap-4">
                <span>{t('landing.benefit2')}</span>
              </li>
              <li className="flex gap-4">
                <span>{t('landing.benefit3')}</span>
              </li>
              <li className="flex gap-4">
                <span>{t('landing.benefit4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={isDark ? 'py-20 bg-gray-800' : 'py-20 bg-gray-50'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">{t('landing.howItWorks')}</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('landing.step1')}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {t('landing.step1Desc')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('landing.step2')}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {t('landing.step2Desc')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{t('landing.step3')}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {t('landing.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">{t('landing.ctaTitle')}</h2>
        <p className={isDark ? 'text-xl mb-8 text-gray-400' : 'text-xl mb-8 text-gray-600'}>
          {t('landing.ctaSubtitle')}
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition inline-block"
        >
          {t('landing.cta')}
        </Link>
      </section>

      {/* Footer */}
      <footer className={isDark ? 'bg-gray-800 border-gray-700 py-12 border-t' : 'bg-gray-50 border-gray-200 py-12 border-t'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
