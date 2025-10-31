import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  progress?: number; // 0-1
  onClick: () => void;
}

export function TopicCard({ topic, isSelected, progress = 0, onClick }: TopicCardProps) {
  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const difficultyLabel = {
    beginner: 'Начинаещ',
    intermediate: 'Среден',
    advanced: 'Напреднал',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1">{topic.title}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColor[topic.difficulty]}`}>
          {difficultyLabel[topic.difficulty]}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{topic.description}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Разбиране</span>
          <span className="text-xs font-semibold text-gray-700">{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {topic.estimatedMinutes} мин
      </div>
    </div>
  );
}
