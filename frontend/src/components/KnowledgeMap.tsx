import { useEffect, useState } from 'react';

interface Knowledge {
  id: string;
  concept: string;
  understandingLevel: number;
  examplesSeen: number;
  lastReviewed: string;
}

interface KnowledgeMapProps {
  aiStudentId: string;
}

function KnowledgeMap({ aiStudentId }: KnowledgeMapProps) {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledge();
  }, [aiStudentId]);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-students/${aiStudentId}/knowledge`);
      const data = await response.json();
      setKnowledge(data.sort((a: Knowledge, b: Knowledge) =>
        b.understandingLevel - a.understandingLevel
      ));
    } catch (error) {
      console.error('Error loading knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (level: number) => {
    if (level >= 0.7) return 'bg-green-500';
    if (level >= 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (level: number) => {
    if (level >= 0.7) return 'Добре разбрано';
    if (level >= 0.3) return 'Частично';
    return 'Начало';
  };

  const getStatusBg = (level: number) => {
    if (level >= 0.7) return 'bg-green-50 border-green-200';
    if (level >= 0.3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'днес';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `преди ${diffDays} дни`;
    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Зареждане на знания...</div>
      </div>
    );
  }

  if (knowledge.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-lg font-medium">Все още няма научени концепции</p>
        <p className="text-gray-500 text-sm mt-2">Започни да обучаваш AI ученика!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Knowledge Map ({knowledge.length} концепции)
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">≥ 70%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">30-70%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">{"< 30%"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {knowledge.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition hover:shadow-md ${getStatusBg(
              item.understandingLevel
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.concept}</h4>
                  <span className="text-xs font-medium text-gray-600">
                    {getStatusText(item.understandingLevel)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStatusColor(
                        item.understandingLevel
                      )}`}
                      style={{ width: `${item.understandingLevel * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {Math.round(item.understandingLevel * 100)}%
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>👁️ {item.examplesSeen} примера</span>
                  <span>📅 Ревюиран {formatDate(item.lastReviewed)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KnowledgeMap;
