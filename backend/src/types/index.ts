// Shared types for the backend

export interface AIStudentContext {
  aiStudentId: string;
  name: string;
  level: number;
  grade: number;
  knownConcepts: string[];
  partialConcepts: string[];
  commonMistakes: string[];
  currentTopic: string;
  currentTopicUnderstanding?: number; // 0-1, understanding level for current topic
  personalityTraits: PersonalityTraits;
}

export interface PersonalityTraits {
  curiosity: number; // 0-1
  confusionRate: number; // 0-1
  learningSpeed: number; // 0-1
}

export interface AIResponse {
  message: string;
  emotion?: 'confused' | 'understanding' | 'excited' | 'neutral';
  understandingDelta?: number; // Change in understanding (-1 to 1)
  shouldAskQuestion?: boolean;
}

export interface TeachingMessage {
  sessionId: string;
  aiStudentId: string;
  userMessage: string;
  context?: Partial<AIStudentContext>;
}

export interface SessionMessage {
  role: 'student' | 'ai_student';
  message: string;
  timestamp: string;
  emotion?: string;
}
