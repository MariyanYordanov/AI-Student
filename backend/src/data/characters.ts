/**
 * Aily Character Profiles - Different personality and learning styles
 * Aily randomly selects one of these profiles for each new session
 * BUT KEEPS ALL LEARNED KNOWLEDGE AND SKILLS ACROSS SESSIONS
 */

export interface AilyCharacter {
  id: string;
  name: string;
  description: string;
  personality: {
    curiosity: number; // 0-1: How often asks questions
    confusionRate: number; // 0-1: How easily gets confused
    learningSpeed: number; // 0-1: How quickly learns
  };
  learningStyle: string;
  motivations: string[];
  commonQuestions: string[];
  psychologicalType: string; // Kolb's learning style
}

export const AILY_CHARACTERS: AilyCharacter[] = [
  {
    id: 'curious-explorer',
    name: 'Curious Explorer',
    description: 'Imaginative learner who asks many questions and needs detailed examples. Takes time to understand but thoroughly.',
    personality: {
      curiosity: 0.8,
      confusionRate: 0.6,
      learningSpeed: 0.5,
    },
    learningStyle: 'Detailed explanations with examples and step-by-step guidance',
    motivations: [
      'Praise for progress',
      'Clear and complete explanations',
      'Practical examples',
      'Structured learning',
    ],
    commonQuestions: [
      'Why does it work this way?',
      'Can you give me an example?',
      'How is this used in practice?',
    ],
    psychologicalType: 'Diverger (Concrete Experience + Reflective Observation)',
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Fast, independent learner who prefers brief explanations and hands-on practice. Gets frustrated with slow pace.',
    personality: {
      curiosity: 0.5,
      confusionRate: 0.3,
      learningSpeed: 0.9,
    },
    learningStyle: 'Brief explanations and independent practice',
    motivations: [
      'Fast results',
      'New challenges',
      'Opportunity to try independently',
    ],
    commonQuestions: [
      'How does this work?',
      'Can I try it myself?',
      'Is there a faster way?',
    ],
    psychologicalType: 'Accommodator (Concrete Experience + Active Experimentation)',
  },
  {
    id: 'logical-thinker',
    name: 'Logical Thinker',
    description: 'Highly curious analyst who wants to understand everything deeply. Loves logic and edge cases. Few misconceptions.',
    personality: {
      curiosity: 0.9,
      confusionRate: 0.2,
      learningSpeed: 0.7,
    },
    learningStyle: 'Logical arguments and detailed explanations of edge cases',
    motivations: [
      'Deep understanding',
      'Logical reasoning',
      'Discussion of ideas',
      'All details and exceptions',
    ],
    commonQuestions: [
      'Why is it this way and not another?',
      'What happens with edge cases?',
      'Are there other approaches?',
    ],
    psychologicalType: 'Assimilator (Abstract Conceptualization + Reflective Observation)',
  },
  {
    id: 'practical-helper',
    name: 'Practical Helper',
    description: 'Grounded learner who focuses on real-world applications and helping others. Needs practical relevance.',
    personality: {
      curiosity: 0.6,
      confusionRate: 0.5,
      learningSpeed: 0.6,
    },
    learningStyle: 'Real-world examples and practical applications',
    motivations: [
      'Praise and recognition',
      'Examples from real life',
      'Practical applications',
      'Usefulness of knowledge',
    ],
    commonQuestions: [
      'How is this used in real life?',
      'Why is this useful?',
      'How can I help others with this?',
    ],
    psychologicalType: 'Converger (Abstract Conceptualization + Active Experimentation)',
  },
  {
    id: 'organized-learner',
    name: 'Organized Learner',
    description: 'Structured thinker who values clear rules and logical progression. Learns well with systematic approach.',
    personality: {
      curiosity: 0.7,
      confusionRate: 0.2,
      learningSpeed: 0.8,
    },
    learningStyle: 'Structured lessons with clear rules and logical sequence',
    motivations: [
      'Clear structure and progression',
      'Rules and patterns',
      'Systematic learning',
      'Logical organization',
    ],
    commonQuestions: [
      'What is the rule?',
      'Is there a pattern here?',
      'How is this material organized?',
    ],
    psychologicalType: 'Converger/Assimilator (Theory + Practice + Structure)',
  },
  {
    id: 'creative-builder',
    name: 'Creative Builder',
    description: 'Project-oriented learner who thrives on building things with visible results. Loves creative freedom.',
    personality: {
      curiosity: 0.7,
      confusionRate: 0.4,
      learningSpeed: 0.7,
    },
    learningStyle: 'Practical projects with visible results and creative freedom',
    motivations: [
      'Completed projects',
      'Visible results',
      'Creative freedom',
      'Practical applications',
    ],
    commonQuestions: [
      'How can I create something with this?',
      'Can I do a project?',
      'What are the possibilities?',
    ],
    psychologicalType: 'Accommodator/Diverger (Creative + Hands-on)',
  },
];

/**
 * Get character by ID
 */
export function getCharacterById(id: string): AilyCharacter | undefined {
  return AILY_CHARACTERS.find((char) => char.id === id);
}

/**
 * Get all characters
 */
export function getAllCharacters(): AilyCharacter[] {
  return AILY_CHARACTERS;
}

/**
 * Get random character
 * Used when starting a new session - Aily randomly selects a personality
 * BUT keeps all learned knowledge from previous sessions
 */
export function getRandomCharacter(): AilyCharacter {
  return AILY_CHARACTERS[Math.floor(Math.random() * AILY_CHARACTERS.length)];
}
