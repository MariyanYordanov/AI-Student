import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';

interface Session {
  id: string;
  topic: string;
  createdAt: string;
  endedAt: string | null;
  durationMinutes: number;
  xpEarned: number;
  transcript: Array<{
    role: string;
    message: string;
    timestamp: string;
    emotion?: string;
  }>;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

function SessionHistory() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { aiStudentId } = useParams<{ aiStudentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Redirect if not logged in or email not verified
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.emailVerified) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadSessions();
  }, [aiStudentId]);

  const loadSessions = async () => {
    if (!aiStudentId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/ai-student/${aiStudentId}/history`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gray-50'}>
      {/* Header */}
      <div className={`px-6 py-4 shadow-sm ${isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('dashboard.sessionHistory')}
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {sessions.length} {t('dashboard.sessionHistory')}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            ← {t('common.back')}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {sessions.length === 0 ? (
          <div className={`text-center py-12 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('dashboard.noSessions')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-lg shadow hover:shadow-md transition cursor-pointer ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {session.topic}
                        </h3>
                        {!session.endedAt && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                            {t('session.sessionEnded')}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(session.createdAt)}
                      </p>
                      <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-1">
                          <span>{session.durationMinutes} {t('dashboard.minutes')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{session.transcript.length} {t('dashboard.messages')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{session.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>
                    <button className={`font-medium text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                      {t('dashboard.viewConversation')} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className={`rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {selectedSession.topic}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(selectedSession.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className={`text-2xl ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ×
                </button>
              </div>
            </div>

            <div className={`overflow-y-auto max-h-[60vh] p-6 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {selectedSession.transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'student' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === 'student'
                        ? 'bg-blue-600 text-white'
                        : isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === 'student' ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('bg-BG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionHistory;
