import { SessionMessage } from '../types';
import { useTheme } from '../hooks/useTheme';

interface ChatMessageProps {
  message: SessionMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const { isDark } = useTheme();
  const isStudent = message.role === 'student';

  const emotionEmojis = {
    confused: '😕',
    understanding: '💡',
    excited: '🤩',
    neutral: '🙂',
  };

  return (
    <div className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isStudent
            ? 'bg-blue-600 text-white'
            : isDark
            ? 'bg-gray-800 text-gray-100 border border-gray-700'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <div className="flex items-start space-x-2">
          {!isStudent && message.emotion && (
            <span className="text-lg" title={message.emotion}>
              {emotionEmojis[message.emotion] || '🙂'}
            </span>
          )}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{message.message}</p>
            <p
              className={`text-xs mt-1 ${
                isStudent ? 'text-blue-100' : isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString('bg-BG', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
