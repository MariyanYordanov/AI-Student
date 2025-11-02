import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { SessionMessage, AIStudent } from '../types';
import ChatMessage from '../components/ChatMessage';
import MessageInput from '../components/MessageInput';

function TeachingSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiStudent, setAIStudent] = useState<AIStudent | null>(null);
  const [topic, setTopic] = useState('');

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
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      const session = await api.getSession(sessionId);
      setMessages(session.transcript);
      setAIStudent(session.aiStudent);
      setTopic(session.topic);
    } catch (error) {
      console.error('Error loading session:', error);
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
      alert('Грешка при изпращане на съобщение');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    const confirm = window.confirm('Сигурен ли си, че искаш да приключиш сесията?');
    if (!confirm) return;

    try {
      const result = await api.endSession(sessionId);

      let message = `Сесията приключи!\n\n`;
      message += `Време: ${result.durationMinutes} мин\n`;
      message += `Съобщения: ${result.messagesExchanged}\n`;
      message += `XP спечелени: +${result.xpEarned}\n`;
      message += `Общо XP: ${result.totalXP}`;

      if (result.leveledUp) {
        message += `\n\nПОЗДРАВЛЕНИЯ!\n`;
        message += `${aiStudent?.name} достигна ниво ${result.newLevel}!`;
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {aiStudent?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {aiStudent?.name || 'AI Ученик'}
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                Тема: {topic} • Ниво {currentLevel}
              </p>
              {/* XP Progress Bar */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  {totalXP} / {XP_THRESHOLDS[currentLevel + 1] || '∞'} XP
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Приключи сесията
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg mb-2">Започни да обучаваш AI ученика!</p>
              <p className="text-sm">Обясни му концепцията ясно и разбираемо</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm">AI ученикът мисли...</span>
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
