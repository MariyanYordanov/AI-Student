import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">История на сесиите</h1>
            <p className="text-sm text-gray-500 mt-1">{sessions.length} сесии общо</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            ← Назад
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">Все още няма завършени сесии</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer border border-gray-200"
                onClick={() => setSelectedSession(session)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.topic}
                        </h3>
                        {!session.endedAt && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Активна
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {formatDate(session.createdAt)}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>{session.durationMinutes} мин</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{session.transcript.length} съобщения</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{session.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Виж разговор →
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
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSession.topic}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedSession.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
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
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === 'student' ? 'text-blue-100' : 'text-gray-500'
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
