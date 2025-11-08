/**
 * Complete JavaScript Topics Curriculum
 * Organized in 5 sections with 6-8 topics each
 */

export interface Topic {
  id: string;
  section: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
}

export const TOPICS_SECTIONS = {
  BASICS: 'basics',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  OOP: 'oop',
  APPLICATIONS: 'applications',
  WEB: 'web',
} as const;

export const TOPICS: Topic[] = [
  // ============================================
  // ОСНОВИ (Basics) - 8 topics
  // ============================================
  {
    id: 'basics-1',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Променливи (let, const, var)',
    description: 'Научи как да създаваш и използваш променливи. Разликите между let, const и var.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
  },
  {
    id: 'basics-2',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Типове данни',
    description: 'Числа, текст, булеви стойности, null, undefined и символи.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-3',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Оператори',
    description: 'Аритметични, логически и сравнение оператори в JavaScript.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
  },
  {
    id: 'basics-4',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Условни оператори',
    description: 'If, else, else if, switch - контролиране на потока на програмата.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-5',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Цикли',
    description: 'For, while, do-while цикли. Управление на повторяемост.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-6',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Функции',
    description: 'Декларация, параметри, return стойности. Основи на функциялния програмиране.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },
  {
    id: 'basics-7',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Масиви',
    description: 'Создаване и работа с масиви. Базови методи и итерация.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },
  {
    id: 'basics-8',
    section: TOPICS_SECTIONS.BASICS,
    title: 'Обекти',
    description: 'Свойства, методи и this. Основи на обектния програмиране.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },

  // ============================================
  // СРЕДНИ (Intermediate) - 7 topics
  // ============================================
  {
    id: 'intermediate-1',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'String методи',
    description: 'trim, split, replace, includes, slice и други методи за работа с текст.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'intermediate-2',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Array методи',
    description: 'map, filter, reduce, forEach, find и други мощни методи.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'intermediate-3',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Higher-order функции',
    description: 'Функции, които приемат или връщат други функции. Callback концепция.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'intermediate-4',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Стрелковни функции',
    description: 'Arrow functions (=>) синтаксис и техните разлики от обичайни функции.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
  },
  {
    id: 'intermediate-5',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Деструктуриране',
    description: 'Деструктуриране на масиви и обекти. Удобен синтаксис за работа с данни.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'intermediate-6',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Spread оператор',
    description: 'Spread (...) оператор. Копиране, слияние и разпръскване на данни.',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
  },
  {
    id: 'intermediate-7',
    section: TOPICS_SECTIONS.INTERMEDIATE,
    title: 'Template literals',
    description: 'Шаблонни текстови низове със интерполация и многоредови текст.',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
  },

  // ============================================
  // НАПРЕДНАЛ (Advanced) - 7 topics
  // ============================================
  {
    id: 'advanced-1',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Асинхронност',
    description: 'Callbacks, Promises и асинхронен код. Управление на асинхронни операции.',
    difficulty: 'advanced',
    estimatedMinutes: 35,
  },
  {
    id: 'advanced-2',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Async/Await',
    description: 'Moderna синтаксис за работа с асинхронен код. Четене и писане на async функции.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'advanced-3',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Event handling',
    description: 'Слушане на събития. addEventListener, event listeners и делегиране.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'advanced-4',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Scope и Closure',
    description: 'Разбиране на scope. Closures и техните приложения.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'advanced-5',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Prototype и наследяване',
    description: 'Прототипно наследяване в JavaScript. Prototype chain.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'advanced-6',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Модули',
    description: 'Import/export синтаксис. Модулна организация на код.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
  },
  {
    id: 'advanced-7',
    section: TOPICS_SECTIONS.ADVANCED,
    title: 'Error handling',
    description: 'Try/catch/finally. Хвърляне и хващане на грешки.',
    difficulty: 'advanced',
    estimatedMinutes: 18,
  },

  // ============================================
  // ООП (Object-Oriented Programming) - 6 topics
  // ============================================
  {
    id: 'oop-1',
    section: TOPICS_SECTIONS.OOP,
    title: 'Класи',
    description: 'ES6 class синтаксис. Дефиниране на класи и инстанциране.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'oop-2',
    section: TOPICS_SECTIONS.OOP,
    title: 'Constructor и методи',
    description: 'Constructor функции. Методи в класи и this контекст.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'oop-3',
    section: TOPICS_SECTIONS.OOP,
    title: 'Наследяване',
    description: 'Extends ключова дума. Наследяване на свойства и методи.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'oop-4',
    section: TOPICS_SECTIONS.OOP,
    title: 'Полиморфизъм',
    description: 'Переопределяне на методи. Полиморфни операции.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
  },
  {
    id: 'oop-5',
    section: TOPICS_SECTIONS.OOP,
    title: 'Инкапсулация',
    description: 'Private и public свойства. Скриване на информация.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
  },
  {
    id: 'oop-6',
    section: TOPICS_SECTIONS.OOP,
    title: 'Статични членове',
    description: 'Статични методи и свойства. Дефиниране и използване.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
  },

  // ============================================
  // ПРАКТИЧЕСКИ (Applications) - 7 topics
  // ============================================
  {
    id: 'applications-1',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'API и Fetch',
    description: 'Fetch API за HTTP заявки. GET, POST, PUT, DELETE операции.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'applications-2',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'JSON работа',
    description: 'JSON формат. Парсване и сериализация на данни.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
  },
  {
    id: 'applications-3',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'Local Storage',
    description: 'Съхранение на данни в браузъра. LocalStorage и SessionStorage.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
  },
  {
    id: 'applications-4',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'Работа с дати',
    description: 'Date обект. Работа с дати и времена в JavaScript.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'applications-5',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'Валидация на форми',
    description: 'Валидиране на потребителски вход. Input validation и user feedback.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'applications-6',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'DOM манипулация',
    description: 'Селектори, добавяне/премахване на елементи, промяна на стилове.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'applications-7',
    section: TOPICS_SECTIONS.APPLICATIONS,
    title: 'Event delegation',
    description: 'Делегиране на събития. Ефективна обработка на събития.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
  },

  // ============================================
  // WEB (Web Development) - 5 topics
  // ============================================
  {
    id: 'web-1',
    section: TOPICS_SECTIONS.WEB,
    title: 'HTML5 основи',
    description: 'HTML5 структура. Семантични елементи и форми.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'web-2',
    section: TOPICS_SECTIONS.WEB,
    title: 'CSS селектори',
    description: 'CSS селектори и свойства. Стилизиране на елементи.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },
  {
    id: 'web-3',
    section: TOPICS_SECTIONS.WEB,
    title: 'Flexbox и Grid',
    description: 'Flexbox и CSS Grid. Модерни техники за оформление.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'web-4',
    section: TOPICS_SECTIONS.WEB,
    title: 'Responsive дизайн',
    description: 'Media queries. Създаване на responsive уеб сайтове.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'web-5',
    section: TOPICS_SECTIONS.WEB,
    title: 'JavaScript интеграция',
    description: 'Интеграция на JavaScript в браузър. DOM и BOM.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
];

/**
 * Get topics by section
 */
export function getTopicsBySection(section: string): Topic[] {
  return TOPICS.filter((topic) => topic.section === section);
}

/**
 * Get all sections with their topic count
 */
export function getAllSections() {
  const sections = Object.values(TOPICS_SECTIONS);
  return sections.map((section) => ({
    id: section.toLowerCase().replace(/\s+/g, '-'),
    name: section,
    topicCount: getTopicsBySection(section).length,
    icon: getSectionIcon(section),
  }));
}

/**
 * Get SVG icon name for section
 */
function getSectionIcon(section: string): string {
  const icons: Record<string, string> = {
    [TOPICS_SECTIONS.BASICS]: 'basics',
    [TOPICS_SECTIONS.INTERMEDIATE]: 'intermediate',
    [TOPICS_SECTIONS.ADVANCED]: 'advanced',
    [TOPICS_SECTIONS.OOP]: 'oop',
    [TOPICS_SECTIONS.APPLICATIONS]: 'applications',
    [TOPICS_SECTIONS.WEB]: 'web',
  };
  return icons[section] || 'basics';
}

/**
 * Get single topic by ID
 */
export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
