import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useTopicsStore } from '../stores/topicsStore';
import { SectionTabs } from '../components/SectionTabs';
import { TopicCard } from '../components/TopicCard';
import { api } from '../services/api';
import { Knowledge } from '../types';

interface AilyInstance {
  id: string;
  userId: string;
  currentCharacterId: string;
  level: number;
  totalXP: number;
}

function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
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

  const [ailyInstance, setAilyInstance] = useState<AilyInstance | null>(null);
  const [isLoadingAily, setIsLoadingAily] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [ailyProgress, setAilyProgress] = useState<Record<string, any>>({});

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
      if (sessionEndedData && ailyInstance) {
        // Load the Aily to show updated progress
        const loadAily = async () => {
          try {
            // Reload Aily knowledge/progress
            const knowledge = await api.aiStudents.getAIStudentKnowledge(ailyInstance.id);
            const progressMap: Record<string, Knowledge> = {};
            knowledge.forEach((k: Knowledge) => {
              progressMap[k.concept] = k;
            });
            setAilyProgress(progressMap);
          } catch (error) {
            console.error('Error loading Aily progress:', error);
          }
        };
        loadAily();
        // Clear the sessionStorage
        sessionStorage.removeItem('sessionJustEnded');
        // Clear the URL param
        navigate('/', { replace: true });
      }
    }
  }, [searchParams, ailyInstance, navigate]);

  // Load Aily instance
  useEffect(() => {
    const loadAily = async () => {
      try {
        if (user) {
          // Fetch Aily instances for this user
          const ailyInstances = await api.aiStudents.getUserStudents(user.id);

          if (ailyInstances && ailyInstances.length > 0) {
            // Use the first (or most recent) Aily instance
            const aily = ailyInstances[0];
            setAilyInstance(aily);

            // Load knowledge/progress for this Aily
            try {
              const knowledge = await api.aiStudents.getAIStudentKnowledge(aily.id);
              console.log('[DEBUG] Loaded knowledge:', knowledge);
              const progressMap: Record<string, Knowledge> = {};
              knowledge.forEach((k: Knowledge) => {
                progressMap[k.concept] = k;
              });
              console.log('[DEBUG] Progress map:', progressMap);
              setAilyProgress(progressMap);
            } catch (error) {
              console.error('Error loading Aily knowledge:', error);
            }
          } else {
            // No Aily instance found - user needs to select a character first
            console.warn('No Aily instance found for user. Redirecting to character selection...');
            // TODO: Redirect to character selection page when implemented
            setAilyInstance(null);
          }
        }
      } catch (error) {
        console.error('Error loading Aily:', error);
        setAilyInstance(null);
      } finally {
        setIsLoadingAily(false);
      }
    };

    loadAily();
  }, [user]);

  // Load topics - reload when language changes
  useEffect(() => {
    fetchAllTopics();
    if (user) {
      fetchUserProgress(user.id);
    }
  }, [user, i18n.language]); // Add i18n.language as dependency

  // Auto-select first section
  useEffect(() => {
    if (topics.length > 0 && !selectedSection) {
      const sections = [...new Set(topics.map((t) => t.section))];
      if (sections.length > 0) {
        selectSection(sections[0]);
      }
    }
  }, [topics]);

  const handleStartSession = async () => {
    if (!user) {
      alert('Моля, влез в акаунта си първо.');
      return;
    }

    if (!selectedTopic) {
      alert('Моля, избери тема първо.');
      return;
    }

    if (!ailyInstance) {
      alert('Зареждане на Aily... Моля, опитай отново след малко.');
      return;
    }

    setIsStarting(true);
    try {
      // Use English title for session topic (saved as Knowledge.concept)
      const session = await api.startSession(user.id, ailyInstance.id, selectedTopic.titleEn);

      if (!session || !session.id) {
        throw new Error('Session was not created properly');
      }

      navigate(`/teach/${session.id}`);
    } catch (error) {
      console.error('[ERR] Session start failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Възникна грешка. Моля, опитай отново.';
      alert(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const topicsInSection = selectedSection ? topics.filter((t) => t.section === selectedSection) : [];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Aily Card at Top */}
      <div className="fixed left-0 right-0 top-16 z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl shadow-xl p-4 sm:p-6 bg-white dark:bg-gray-800 max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Aily Info */}
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{t('common.appName')}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t('session.aiStudent')}
                </p>
              </div>

              {/* Stats and Topic */}
              {!isLoadingAily && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Level & XP */}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        {t('dashboard.level')}: <span className="text-blue-600 dark:text-blue-400">{ailyInstance?.level || 0}</span>
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        {t('dashboard.xp')}: <span className="text-blue-600 dark:text-blue-400">{ailyInstance?.totalXP || 0}</span>
                      </p>
                    </div>
                  </div>

                  {/* Topic and Button */}
                  {selectedTopic && (
                    <button
                      onClick={handleStartSession}
                      disabled={isStarting || !selectedTopic || !ailyInstance}
                      className={`px-4 py-2 font-semibold rounded-lg transition text-sm flex items-center justify-center whitespace-nowrap ${
                        isStarting || !selectedTopic || !ailyInstance
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isStarting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('common.loading')}
                        </>
                      ) : (
                        t('dashboard.startSession')
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Offset for Fixed Card */}
      <div className="pt-36 sm:pt-44 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Topics Section */}
          <div className="rounded-2xl shadow-xl p-6 sm:p-8 bg-white dark:bg-gray-800">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('dashboard.topics')}</h2>

            {topicsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            ) : (
              <>
                <SectionTabs
                  selectedSection={selectedSection}
                  onSelectSection={selectSection}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topicsInSection.map((topic) => {
                    // Use English title (titleEn) for matching with Knowledge.concept
                    const progress = ailyProgress?.[topic.titleEn]?.understandingLevel || 0;
                    console.log(`[DEBUG] Topic "${topic.title}" (${topic.titleEn}) progress:`, progress);
                    return (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        isSelected={selectedTopic?.id === topic.id}
                        progress={progress}
                        onClick={() => selectTopic(topic)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
