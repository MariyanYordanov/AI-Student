// Shared types for frontend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt?: string;
}

export interface Topic {
  id: string;
  section: string;
  title: string;
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
