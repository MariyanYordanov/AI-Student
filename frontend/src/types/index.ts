// Shared types for frontend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
  emailVerified: boolean;
  createdAt?: string;
}

export interface Topic {
  id: string;
  section: string;
  title: string; // Localized title
  titleEn: string; // English title for matching with Knowledge.concept
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
}

export interface TopicProgress {
  topicId: string;
  topicTitle: string;
  understandingLevel: number;
  sessionsCount: number;
  lastStudied: string;
}

export interface AIStudent {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  personalityTraits: {
    curiosity: number;
    confusionRate: number;
    learningSpeed: number;
  };
}

export interface SessionMessage {
  role: 'student' | 'ai_student';
  message: string;
  timestamp: string;
  emotion?: 'confused' | 'understanding' | 'excited' | 'neutral';
}

export interface Session {
  id: string;
  studentId: string;
  aiStudentId: string;
  topic: string;
  durationMinutes: number;
  xpEarned: number;
  transcript: SessionMessage[];
  createdAt: string;
  endedAt?: string;
}

export interface Knowledge {
  id: string;
  ailyInstanceId: string;
  concept: string;
  understandingLevel: number;
  examplesSeen: number;
  lastReviewed: string;
  createdAt: string;
  updatedAt: string;
}

export interface AilyInstance {
  id: string;
  userId: string;
  currentCharacterId: string;
  name?: string; // Optional for compatibility with AIStudent
  level: number;
  totalXP: number;
  personalityTraits: {
    curiosity: number;
    confusionRate: number;
    learningSpeed: number;
  };
  createdAt: string;
  updatedAt: string;
}
