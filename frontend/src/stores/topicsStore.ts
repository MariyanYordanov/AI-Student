import { create } from 'zustand';
import { Topic, TopicProgress } from '../types';
import { api } from '../services/api';

interface TopicsState {
  topics: Topic[];
  selectedSection: string | null;
  selectedTopic: Topic | null;
  userProgress: Record<string, TopicProgress> | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllTopics: () => Promise<void>;
  selectSection: (section: string) => void;
  selectTopic: (topic: Topic) => void;
  fetchUserProgress: (userId: string) => Promise<void>;
  recordTopicProgress: (topicId: string, understandingLevel: number) => Promise<void>;
  clearError: () => void;
}

export const useTopicsStore = create<TopicsState>((set, get) => ({
  topics: [],
  selectedSection: null,
  selectedTopic: null,
  userProgress: null,
  isLoading: false,
  error: null,

  fetchAllTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.topics.getAllTopics();
      // Flatten all topics from sections
      const allTopics: Topic[] = [];
      Object.values(response.sections).forEach((section: { topics: Topic[] }) => {
        allTopics.push(...section.topics);
      });
      set({ topics: allTopics, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Грешка при зареждане на теми';
      set({ error: message, isLoading: false });
    }
  },

  selectSection: (section: string) => {
    set({ selectedSection: section, selectedTopic: null });
  },

  selectTopic: (topic: Topic) => {
    set({ selectedTopic: topic });
  },

  fetchUserProgress: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.topics.getUserProgress(userId);
      // Transform response into a flat map for easier access
      const progressMap: Record<string, TopicProgress> = {};
      Object.values(response).forEach((section: { topics?: TopicProgress[] }) => {
        section.topics?.forEach((topic: TopicProgress) => {
          progressMap[topic.topicId] = topic;
        });
      });
      set({ userProgress: progressMap, isLoading: false });
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ isLoading: false });
    }
  },

  recordTopicProgress: async (topicId: string, understandingLevel: number) => {
    try {
      await api.topics.recordProgress(topicId, understandingLevel);
      // Update local progress
      const currentProgress = get().userProgress || {};
      currentProgress[topicId] = {
        topicId,
        topicTitle: get().selectedTopic?.title || '',
        understandingLevel,
        sessionsCount: (currentProgress[topicId]?.sessionsCount || 0) + 1,
        lastStudied: new Date().toISOString(),
      };
      set({ userProgress: currentProgress });
    } catch (error) {
      console.error('Error recording progress:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
