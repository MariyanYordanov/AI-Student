import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TeacherStats {
  totalAIStudents: number;
  totalSessions: number;
  totalTeachingMinutes: number;
  totalXPGiven: number;
  averageAILevel: number;
  mostTaughtConcepts: Array<{ concept: string; count: number }>;
  aiStudents: Array<{
    id: string;
    name: string;
    level: number;
    totalXP: number;
    sessionCount: number;
    knowledgeCount: number;
  }>;
}

function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const TEMP_USER_ID = 'temp-user-123';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/student/${TEMP_USER_ID}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Грешка при зареждане</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Преглед на твоето преподаване</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            ← Назад
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">AI Ученици</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalAIStudents}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Сесии</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalSessions}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Време обучение</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalTeachingMinutes}
              <span className="text-lg text-gray-500 ml-1">мин</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Общо XP</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalXPGiven}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Средно ниво</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.averageAILevel}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Students List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Твоите AI Ученици
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {stats.aiStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Все още нямаш AI ученици
                </p>
              ) : (
                stats.aiStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/history/${student.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ниво {student.level} • {student.totalXP} XP
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.sessionCount} сесии
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.knowledgeCount} концепции
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most Taught Concepts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Най-преподавани концепции
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {stats.mostTaughtConcepts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Все още не си преподавал концепции
                </p>
              ) : (
                stats.mostTaughtConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {item.concept}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {item.count} {item.count === 1 ? 'път' : 'пъти'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Готов за ново обучение?</h2>
          <p className="text-blue-100 mb-6">
            Създай нов AI ученик и започни да преподаваш
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            🚀 Започни нова сесия
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
