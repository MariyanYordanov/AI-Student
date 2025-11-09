// API client for backend communication
import { AilyInstance, Knowledge, User, Topic, Session } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Get current language for API requests
 */
function getCurrentLanguage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'en';
  }
  return 'en';
}

/**
 * Enhanced fetch with timeout and better error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const token = getAuthToken();
    const language = getCurrentLanguage();
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': language,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      // Network error
      if (error.name === 'AbortError') {
        throw new Error('Заявката отне твърде дълго време. Провери интернет връзката.');
      }
      // No connection to server
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Няма връзка със сървъра. Работи ли backend на port 4000?');
      }
    }
    throw error;
  }
}

/**
 * Handle API response errors with user-friendly messages
 */
async function handleResponse<T = unknown>(response: Response): Promise<T> {
  if (!response.ok) {
    // Unauthorized
    if (response.status === 401) {
      const error = await response.json().catch(() => ({ error: 'Unauthorized' }));
      throw new Error(`${error.error || 'Невалидни идентификационни данни'}`);
    }
    // Server errors
    if (response.status >= 500) {
      throw new Error('Сървърът има проблем. Опитай след малко.');
    }
    // Not found
    if (response.status === 404) {
      throw new Error('Ресурсът не е намерен.');
    }
    // Bad request
    if (response.status === 400) {
      const error = await response.json().catch(() => ({ error: 'Bad request' }));
      throw new Error(`${error.error || 'Невалидна заявка'}`);
    }
    // Generic error
    throw new Error(`Грешка: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    async register(email: string, name: string, password: string) {
      const response = await fetchWithTimeout(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      return handleResponse<{ token: string; user: User }>(response);
    },

    async login(email: string, password: string) {
      const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      // Backend returns flat object with all user fields + token
      return handleResponse<User & { token: string }>(response);
    },

    async getCurrentUser() {
      const response = await fetchWithTimeout(`${API_BASE}/auth/me`);
      return handleResponse<User>(response);
    },

    async logout() {
      const response = await fetchWithTimeout(`${API_BASE}/auth/logout`, {
        method: 'POST',
      });
      return handleResponse<{ message: string }>(response);
    },

    async updatePreferences(preferredTheme?: string, preferredLanguage?: string) {
      const body: { preferredTheme?: string; preferredLanguage?: string } = {};
      if (preferredTheme) body.preferredTheme = preferredTheme;
      if (preferredLanguage) body.preferredLanguage = preferredLanguage;

      const response = await fetchWithTimeout(`${API_BASE}/auth/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return handleResponse<User>(response);
    },
  },

  // Topics
  topics: {
    async getAllTopics() {
      const response = await fetchWithTimeout(`${API_BASE}/topics`);
      return handleResponse<{ totalTopics: number; sections: Record<string, { topics: Topic[] }> }>(response);
    },

    async getTopic(topicId: string) {
      const response = await fetchWithTimeout(`${API_BASE}/topics/${topicId}`);
      return handleResponse<Topic>(response);
    },

    async getUserProgress(userId: string) {
      const response = await fetchWithTimeout(`${API_BASE}/topics/user/${userId}/progress`);
      return handleResponse<Record<string, unknown>>(response);
    },

    async recordProgress(topicId: string, understandingLevel: number) {
      const response = await fetchWithTimeout(`${API_BASE}/topics/${topicId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understandingLevel }),
      });
      return handleResponse<{ message: string }>(response);
    },

    async getTopicsBySection(sectionName: string) {
      const response = await fetchWithTimeout(`${API_BASE}/topics/section/${sectionName}`);
      return handleResponse<{ topics: Topic[] }>(response);
    },
  },

  // AI Students
  aiStudents: {
    async getCharacters() {
      const response = await fetchWithTimeout(`${API_BASE}/ai-students/characters`);
      return handleResponse<AilyInstance[]>(response);
    },

    async selectCharacter(characterId: string) {
      const response = await fetchWithTimeout(`${API_BASE}/ai-students/select-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      return handleResponse<AilyInstance>(response);
    },

    async getUserStudents(userId: string) {
      const response = await fetchWithTimeout(`${API_BASE}/ai-students/user/${userId}`);
      return handleResponse<AilyInstance[]>(response);
    },

    async getAIStudent(id: string) {
      const response = await fetchWithTimeout(`${API_BASE}/ai-students/${id}`);
      return handleResponse<AilyInstance>(response);
    },

    async getAIStudentKnowledge(id: string) {
      const response = await fetchWithTimeout(`${API_BASE}/ai-students/${id}/knowledge`);
      return handleResponse<Knowledge[]>(response);
    },
  },

  // Legacy methods for backward compatibility
  async createAIStudent(ownerId: string, name: string) {
    const response = await fetchWithTimeout(`${API_BASE}/ai-students/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, name }),
    });
    return handleResponse<AilyInstance>(response);
  },

  async getAIStudent(id: string) {
    const response = await fetchWithTimeout(`${API_BASE}/ai-students/${id}`);
    return handleResponse<AilyInstance>(response);
  },

  async getAIStudentKnowledge(id: string) {
    const response = await fetchWithTimeout(`${API_BASE}/ai-students/${id}/knowledge`);
    return handleResponse<Knowledge[]>(response);
  },

  // Sessions
  async startSession(studentId: string, aiStudentId: string, topic: string) {
    const response = await fetchWithTimeout(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, aiStudentId, topic }),
    });
    return handleResponse<Session>(response);
  },

  async sendMessage(sessionId: string, message: string) {
    const response = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse<{ response: string; emotion: string; newLevel?: number }>(response);
  },

  async endSession(sessionId: string) {
    const response = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/end`, {
      method: 'POST',
    });
    return handleResponse<{ xpEarned: number; newLevel: number; qualityScore: number }>(response);
  },

  async getSession(sessionId: string) {
    const response = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}`);
    return handleResponse<Session>(response);
  },
};
