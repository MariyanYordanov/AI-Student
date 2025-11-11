import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { SessionMessage, AilyInstance } from '../types';
import ChatMessage from '../components/ChatMessage';
import MessageInput from '../components/MessageInput';

function TeachingSession() {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiStudent, setAIStudent] = useState<AilyInstance | null>(null);
  const [topic, setTopic] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in or email not verified
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.emailVerified) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (sessionId && sessionId !== 'undefined') {
      loadSession();
    } else if (!sessionId || sessionId === 'undefined') {
      // No valid sessionId - redirect to dashboard
      console.error('No valid sessionId, redirecting to dashboard');
      navigate('/');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    if (!sessionId || sessionId === 'undefined') {
      console.error('Invalid sessionId in loadSession:', sessionId);
      navigate('/');
      return;
    }

    setIsLoadingSession(true);
    setLoadError(null);

    try {
      const session = await api.getSession(sessionId);
      setMessages(session.transcript);
      // Load AI Student by ID
      if (session.aiStudentId) {
        const aiStudent = await api.getAIStudent(session.aiStudentId);
        setAIStudent(aiStudent);
      }
      setTopic(session.topic);
      setLoadError(null);
    } catch (error) {
      console.error('Error loading session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Възникна грешка';

      // Check if it's a timeout error
      if (errorMessage.includes('твърде дълго време') || errorMessage.includes('timeout')) {
        setLoadError('Backend-ът се събужда (Render free tier). Моля, изчакай 30-60 секунди и refresh-ни страницата.');
      } else if (errorMessage.includes('не е намерен')) {
        setLoadError('Сесията не е намерена. Пренасочване към Dashboard...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setLoadError(`Грешка при зареждане: ${errorMessage}`);
      }
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId || !message.trim()) return;

    setLoading(true);
    try {
      await api.sendMessage(sessionId, message);
      await loadSession();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Възникна грешка';

      if (errorMessage.includes('твърде дълго време') || errorMessage.includes('timeout')) {
        alert('Backend-ът се събужда. Изчакай 10-20 секунди и опитай отново.');
      } else {
        alert(`Грешка: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    const confirm = window.confirm(t('session.endSession') + '?');
    if (!confirm) return;

    try {
      const result = await api.endSession(sessionId);

      let message = `${t('session.sessionEnded')}!\n\n`;
      message += `${t('session.xpEarned')}: +${result.xpEarned}\n`;
      message += `${t('common.appName')} ${t('dashboard.level')} ${result.newLevel}`;

      if (result.qualityScore) {
        message += `\n${t('session.quality')}: ${Math.round(result.qualityScore * 100)}%`;
      }

      alert(message);
      // Store the session ended flag in sessionStorage so Dashboard knows to refresh
      if (aiStudent) {
        sessionStorage.setItem('sessionJustEnded', JSON.stringify({
          aiStudentId: aiStudent.id,
          timestamp: Date.now(),
        }));
      }
      navigate('/?viewTopics=true');
    } catch (error) {
      console.error('Error ending session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Възникна грешка';

      if (errorMessage.includes('твърде дълго време') || errorMessage.includes('timeout')) {
        alert('Backend-ът не отговаря. Сесията може вече да е приключила. Връщане към Dashboard...');
        navigate('/');
      } else {
        alert(`Грешка при приключване на сесията: ${errorMessage}`);
      }
    }
  };

  // XP system constants
  const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
  const currentLevel = aiStudent?.level || 0;
  const totalXP = aiStudent?.totalXP || 0;
  const currentLevelXP = totalXP - XP_THRESHOLDS[currentLevel];
  const nextLevelXP = XP_THRESHOLDS[currentLevel + 1] - XP_THRESHOLDS[currentLevel];
  const xpProgress = nextLevelXP > 0 ? Math.min((currentLevelXP / nextLevelXP) * 100, 100) : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {t('common.appName').charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('common.appName')}
              </h2>
              <p className="text-sm mb-1 text-gray-500 dark:text-gray-400">
                {t('session.topic')}: {topic} • {t('dashboard.level')} {currentLevel}
              </p>
              {/* XP Progress Bar */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 rounded-full h-2 max-w-xs bg-gray-200 dark:bg-gray-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap text-gray-600 dark:text-gray-400">
                  {totalXP} / {XP_THRESHOLDS[currentLevel + 1] || '∞'} XP
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 text-sm font-medium rounded-lg transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {t('session.endSession')}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Loading Session */}
          {isLoadingSession && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Зареждане на сесията...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Ако Backend-ът спи, това може да отнеме до 60 секунди</p>
            </div>
          )}

          {/* Load Error */}
          {loadError && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-lg mx-auto">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">⚠️ Проблем при зареждане</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">{loadError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {!isLoadingSession && !loadError && messages.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">{t('session.inputPlaceholder')}</p>
              <p className="text-sm">{t('session.tipText')}</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm">{t('common.appName')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
}

export default TeachingSession;
