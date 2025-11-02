import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTopicsStore } from '../stores/topicsStore';
import { SectionTabs } from '../components/SectionTabs';
import { TopicCard } from '../components/TopicCard';
import { ICON_MAP } from '../data/topics';
import { api } from '../services/api';

interface StudentCharacter {
  id: string;
  name: string;
  avatar: string;
  personality: {
    curiosity: number;
    confusionRate: number;
    learningSpeed: number;
  };
}

interface AIStudent {
  id: string;
  characterId: string;
  name: string;
  level: number;
  totalXP: number;
  personalityTraits: any;
}

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const {
    topics,
    selectedSection,
    selectedTopic,
    isLoading: topicsLoading,
    fetchAllTopics,
    selectSection,
    selectTopic,
    fetchUserProgress,
  } = useTopicsStore();

  const [characters, setCharacters] = useState<StudentCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<StudentCharacter | null>(null);
  const [aiStudent, setAiStudent] = useState<AIStudent | null>(null);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [step, setStep] = useState<'characters' | 'topics'>('characters');
  const [aiStudentProgress, setAiStudentProgress] = useState<Record<string, any>>({});

  // Redirect if not logged in or email not verified
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.emailVerified) {
      // Block unverified users from accessing dashboard
      navigate('/login');
    }
  }, [user, navigate]);

  // Check if coming back from session with viewTopics param
  useEffect(() => {
    if (searchParams.get('viewTopics') === 'true') {
      const sessionEndedData = sessionStorage.getItem('sessionJustEnded');
      if (sessionEndedData) {
        const { aiStudentId } = JSON.parse(sessionEndedData);
        // Load the AI student to show updated progress
        const loadStudent = async () => {
          try {
            const student = await api.aiStudents.getAIStudent(aiStudentId);
            // Find matching character
            const matchingCharacter = characters.find(c => c.id === student.characterId);
            if (matchingCharacter) {
              setSelectedCharacter(matchingCharacter);
              setAiStudent(student);
              setStep('topics');
              // Load knowledge/progress for this student
              const knowledge = await api.aiStudents.getAIStudentKnowledge(aiStudentId);
              const progressMap: Record<string, any> = {};
              knowledge.forEach((k: any) => {
                progressMap[k.concept] = k;
              });
              setAiStudentProgress(progressMap);
            }
          } catch (error) {
            console.error('Error loading AI student:', error);
          }
        };
        loadStudent();
        // Clear the sessionStorage
        sessionStorage.removeItem('sessionJustEnded');
        // Clear the URL param
        navigate('/', { replace: true });
      }
    }
  }, [searchParams, characters, navigate]);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const chars = await api.aiStudents.getCharacters();
        setCharacters(chars);
      } catch (error) {
        console.error('Error loading characters:', error);
      } finally {
        setIsLoadingCharacters(false);
      }
    };

    loadCharacters();
  }, []);

  // Load topics
  useEffect(() => {
    fetchAllTopics();
    if (user) {
      fetchUserProgress(user.id);
    }
  }, [user]);

  // Auto-select first section
  useEffect(() => {
    if (topics.length > 0 && !selectedSection) {
      const sections = [...new Set(topics.map((t) => t.section))];
      if (sections.length > 0) {
        selectSection(sections[0]);
      }
    }
  }, [topics]);

  // Reload AI student when we return to topics step to show updated progress
  useEffect(() => {
    if (step === 'topics' && selectedCharacter && !aiStudent) {
      // AI student was already loaded, no need to reload
    } else if (step === 'topics' && selectedCharacter && aiStudent) {
      // Reload the AI student to get updated XP/level
      const reloadStudent = async () => {
        try {
          const student = await api.aiStudents.getAIStudent(aiStudent.id);
          setAiStudent(student);
          // Also load the knowledge/progress for this student
          const knowledge = await api.aiStudents.getAIStudentKnowledge(aiStudent.id);
          const progressMap: Record<string, any> = {};
          knowledge.forEach((k: any) => {
            progressMap[k.concept] = k;
          });
          setAiStudentProgress(progressMap);
        } catch (error) {
          console.error('Error reloading AI student:', error);
        }
      };
      reloadStudent();
    }
  }, [step]);

  const handleSelectCharacter = async (character: StudentCharacter) => {
    setSelectedCharacter(character);
    setIsStarting(true);
    try {
      const student = await api.aiStudents.selectCharacter(character.id);
      setAiStudent(student);
      setStep('topics');
    } catch (error) {
      console.error('Error selecting character:', error);
      alert(error instanceof Error ? error.message : 'Error selecting character');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedTopic || !aiStudent || !user) {
      alert('Моля попълни всички полета');
      return;
    }

    setIsStarting(true);
    try {
      const session = await api.startSession(user.id, aiStudent.id, selectedTopic.title);
      navigate(`/teach/${session.sessionId}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Грешка при стартиране на сесия');
    } finally {
      setIsStarting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const topicsInSection = selectedSection ? topics.filter((t) => t.section === selectedSection) : [];

  if (!user) {
    return null;
  }

  // Step 1: Select Character
  if (step === 'characters') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Учител-Ученик</h1>
              <p className="text-gray-600 mt-2">Добре дошъл, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Изход
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Избери своя виртуален ученик</h2>

            {isLoadingCharacters ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Зареждане на персонажи...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => handleSelectCharacter(character)}
                    disabled={isStarting}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedCharacter?.id === character.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img src={character.avatar} alt={character.name} className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{character.name}</h3>
                    </div>

                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex justify-between">
                        <span>Любознателност:</span>
                        <span className="font-semibold">{Math.round(character.personality.curiosity * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Обърканост:</span>
                        <span className="font-semibold">{Math.round(character.personality.confusionRate * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Скорост на обучение:</span>
                        <span className="font-semibold">{Math.round(character.personality.learningSpeed * 100)}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select Topic
  if (step === 'topics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Учител-Ученик</h1>
              <p className="text-gray-600 mt-2">Добре дошъл, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Изход
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topics Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">JavaScript Теми</h2>
                <button
                  onClick={() => setStep('characters')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Смени ученик
                </button>
              </div>

              {topicsLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Зареждане на теми...</p>
                </div>
              ) : (
                <>
                  <SectionTabs
                    selectedSection={selectedSection}
                    onSelectSection={selectSection}
                    iconMap={ICON_MAP}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topicsInSection.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        isSelected={selectedTopic?.id === topic.id}
                        progress={aiStudentProgress?.[topic.title]?.understandingLevel || 0}
                        onClick={() => selectTopic(topic)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Student Info & Start Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
              <div className="flex items-center gap-3 mb-6">
                {selectedCharacter?.avatar && (
                  <div className="w-12 h-12">
                    <img src={selectedCharacter.avatar} alt={selectedCharacter.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{selectedCharacter?.name}</h3>
              </div>

              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Характеристики</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Любознателност:</span>
                      <span className="font-semibold">
                        {Math.round((selectedCharacter?.personality.curiosity || 0) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Обучение скорост:</span>
                      <span className="font-semibold">
                        {Math.round((selectedCharacter?.personality.learningSpeed || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Прогрес</p>
                  <p className="text-sm">
                    <span className="font-semibold">Ниво: {aiStudent?.level || 0}</span>
                  </p>
                  <p className="text-xs text-gray-600">XP: {aiStudent?.totalXP || 0}</p>
                </div>
              </div>

              {selectedTopic && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-1">Избрана тема:</p>
                  <p className="text-sm text-blue-700 font-semibold">{selectedTopic.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedTopic.description}</p>
                </div>
              )}

              <button
                onClick={handleStartSession}
                disabled={isStarting || !selectedTopic}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isStarting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Създаване...
                  </>
                ) : (
                  'Начало на сесия'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Dashboard;
