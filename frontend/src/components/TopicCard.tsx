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
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? isDark
            ? 'border-blue-400 bg-blue-50'
            : 'border-blue-500 bg-blue-50'
          : isDark
          ? 'border-gray-300 bg-white hover:border-blue-300'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-sm flex-1 ${isDark ? 'text-gray-900' : 'text-gray-900'}`}>
          {topic.title}
        </h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColor[topic.difficulty]}`}>
          {t(`dashboard.${topic.difficulty}`)}
        </span>
      </div>

      <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-gray-600' : 'text-gray-600'}`}>
        {topic.description}
      </p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">
            {t('dashboard.progress')}
          </span>
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="w-full rounded-full h-1.5 bg-gray-200">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {topic.estimatedMinutes} {t('dashboard.minutes')}
      </div>
    </div>
  );
}
