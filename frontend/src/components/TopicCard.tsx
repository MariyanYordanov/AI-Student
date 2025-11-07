import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  progress?: number; // 0-1
  onClick: () => void;
}

export function TopicCard({ topic, isSelected, progress = 0, onClick }: TopicCardProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const difficultyColor = {
    beginner: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800',
    intermediate: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
    advanced: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? isDark
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-blue-500 bg-blue-50'
          : isDark
          ? 'border-gray-700 bg-gray-800 hover:border-blue-400'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-sm flex-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {topic.title}
        </h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColor[topic.difficulty]}`}>
          {t(`dashboard.${topic.difficulty}`)}
        </span>
      </div>

      <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {topic.description}
      </p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('dashboard.progress')}
          </span>
          <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {topic.estimatedMinutes} {t('dashboard.minutes')}
      </div>
    </div>
  );
}
