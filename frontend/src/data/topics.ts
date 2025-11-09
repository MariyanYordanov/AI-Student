/**
 * Frontend representation of topics structure
 * This mirrors the backend topics data for use in the UI
 * Keys must match backend section names (English)
 */

export const TOPICS_SECTIONS = {
  BASICS: 'basics',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  OOP: 'oop',
  APPLICATIONS: 'applications',
  WEB: 'web',
} as const;
