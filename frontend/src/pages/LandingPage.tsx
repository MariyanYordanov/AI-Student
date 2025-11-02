import { Link } from 'react-router-dom';
import { BookOpen, Brain, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Aily</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Вход
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Учи с помощта на <span className="text-blue-600">AI Ученик</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Aily е революционна платформа, където можеш да проверяваш своите знания, като учиш AI ученик по различни теми.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg transition"
          >
            Започни сега
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-lg transition"
          >
            Вече имам акаунт
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Защо Aily?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Ученик</h3>
              <p className="text-gray-600">
                Работи с реалистичен AI ученик, който разпитва и учи по теми, които избереш.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Множество Теми</h3>
              <p className="text-gray-600">
                Избери от разнообразие теми и области, за да проверяваш своите знания.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Проследяване на Прогреса</h3>
              <p className="text-gray-600">
                Виждай своя прогрес, събирай опит и следи развитието си по време.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Как работи?</h2>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Регистрирай се</h3>
              <p className="text-gray-600 text-lg">
                Създай своя акаунт с валиден имейл адрес. След верификация можеш да начнеш.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Избери персонаж</h3>
              <p className="text-gray-600 text-lg">
                Избери AI ученик с различни черти на личност, които ще доберат изживяването.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Начни обучение</h3>
              <p className="text-gray-600 text-lg">
                Избери тема и начни да учиш своя AI ученик. Разпитай го, отговори на неговите въпроси.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 items-start">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Следи прогреса</h3>
              <p className="text-gray-600 text-lg">
                Виждай как расте твоя AI ученик и какво е научил. Събирай опит и разблокирай нови теми.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Готов ли си да начнеш?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Присъединяй се към хиляди студенти, които учат и растат с Aily.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg transition"
          >
            Регистрирай се сега
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-white">Aily</span>
              </div>
              <p className="text-sm">Платформа за учене с AI</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Начало</a></li>
                <li><a href="#" className="hover:text-white transition">За нас</a></li>
                <li><a href="#" className="hover:text-white transition">Функции</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Правни</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Условия</a></li>
                <li><a href="#" className="hover:text-white transition">Приватност</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Контакт</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@learnmate.com" className="hover:text-white transition">support@learnmate.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>Copyright 2024 Aily. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
