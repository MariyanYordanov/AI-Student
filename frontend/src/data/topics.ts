/**
 * Frontend representation of topics structure
 * This mirrors the backend topics data for use in the UI
 */

export const TOPICS_SECTIONS = {
  BASICS: 'Основи',
  INTERMEDIATE: 'Средни',
  ADVANCED: 'Напреднал',
  OOP: 'ООП',
  APPLICATIONS: 'Практически',
  WEB: 'Web',
} as const;

export const ICON_MAP: Record<string, string> = {
  'Основи': '/src/assets/icons/basics.svg',
  'Средни': '/src/assets/icons/intermediate.svg',
  'Напреднал': '/src/assets/icons/advanced.svg',
  'ООП': '/src/assets/icons/oop.svg',
  'Практически': '/src/assets/icons/applications.svg',
  'Web': '/src/assets/icons/web.svg',
};
