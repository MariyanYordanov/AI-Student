import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TopicData {
  id: string;
  section: string;
  titleEn: string;
  titleBg: string;
  descriptionEn: string;
  descriptionBg: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
}

const topics: TopicData[] = [
  // ============================================
  // BASICS - 8 topics
  // ============================================
  {
    id: 'basics-1',
    section: 'basics',
    titleEn: 'Variables (let, const, var)',
    titleBg: 'Променливи (let, const, var)',
    descriptionEn: 'Learn how to create and use variables. Differences between let, const and var.',
    descriptionBg: 'Научи как да създаваш и използваш променливи. Разликите между let, const и var.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
  },
  {
    id: 'basics-2',
    section: 'basics',
    titleEn: 'Data Types',
    titleBg: 'Типове данни',
    descriptionEn: 'Numbers, text, booleans, null, undefined and symbols.',
    descriptionBg: 'Числа, текст, булеви стойности, null, undefined и символи.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-3',
    section: 'basics',
    titleEn: 'Operators',
    titleBg: 'Оператори',
    descriptionEn: 'Arithmetic, logical and comparison operators in JavaScript.',
    descriptionBg: 'Аритметични, логически и сравнение оператори в JavaScript.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
  },
  {
    id: 'basics-4',
    section: 'basics',
    titleEn: 'Conditional Operators',
    titleBg: 'Условни оператори',
    descriptionEn: 'If, else, else if, switch - controlling program flow.',
    descriptionBg: 'If, else, else if, switch - контролиране на потока на програмата.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-5',
    section: 'basics',
    titleEn: 'Loops',
    titleBg: 'Цикли',
    descriptionEn: 'For, while, do-while loops. Managing repetition.',
    descriptionBg: 'For, while, do-while цикли. Управление на повторяемост.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'basics-6',
    section: 'basics',
    titleEn: 'Functions',
    titleBg: 'Функции',
    descriptionEn: 'Declaration, parameters, return values. Functional programming basics.',
    descriptionBg: 'Декларация, параметри, return стойности. Основи на функциялния програмиране.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },
  {
    id: 'basics-7',
    section: 'basics',
    titleEn: 'Arrays',
    titleBg: 'Масиви',
    descriptionEn: 'Creating and managing arrays. Basic array methods.',
    descriptionBg: 'Създаване и управление на масиви. Основни методи на масивите.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },
  {
    id: 'basics-8',
    section: 'basics',
    titleEn: 'Objects',
    titleBg: 'Обекти',
    descriptionEn: 'Creating objects, properties, methods. Working with JSON.',
    descriptionBg: 'Създаване на обекти, свойства, методи. Работа с JSON.',
    difficulty: 'beginner',
    estimatedMinutes: 25,
  },

  // ============================================
  // INTERMEDIATE - 7 topics
  // ============================================
  {
    id: 'intermediate-1',
    section: 'intermediate',
    titleEn: 'Arrow Functions',
    titleBg: 'Arrow функции',
    descriptionEn: 'Modern function syntax. Lexical this binding.',
    descriptionBg: 'Модерен синтаксис на функции. Лексикално this свързване.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'intermediate-2',
    section: 'intermediate',
    titleEn: 'Array Methods',
    titleBg: 'Методи на масиви',
    descriptionEn: 'Map, filter, reduce, forEach - functional programming with arrays.',
    descriptionBg: 'Map, filter, reduce, forEach - функционално програмиране с масиви.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'intermediate-3',
    section: 'intermediate',
    titleEn: 'Destructuring',
    titleBg: 'Деструктуриране',
    descriptionEn: 'Extracting values from arrays and objects.',
    descriptionBg: 'Извличане на стойности от масиви и обекти.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'intermediate-4',
    section: 'intermediate',
    titleEn: 'Spread and Rest',
    titleBg: 'Spread и Rest',
    descriptionEn: 'Spreading arrays/objects and rest parameters.',
    descriptionBg: 'Разпръскване на масиви/обекти и rest параметри.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'intermediate-5',
    section: 'intermediate',
    titleEn: 'Template Literals',
    titleBg: 'Template Literals',
    descriptionEn: 'String interpolation and multi-line strings.',
    descriptionBg: 'Интерполация на стрингове и многоредови стрингове.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
  },
  {
    id: 'intermediate-6',
    section: 'intermediate',
    titleEn: 'Modules',
    titleBg: 'Модули',
    descriptionEn: 'Import/export. Organizing code into modules.',
    descriptionBg: 'Import/export. Организиране на код в модули.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'intermediate-7',
    section: 'intermediate',
    titleEn: 'Error Handling',
    titleBg: 'Обработка на грешки',
    descriptionEn: 'Try, catch, finally. Creating custom errors.',
    descriptionBg: 'Try, catch, finally. Създаване на персонализирани грешки.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },

  // ============================================
  // ADVANCED - 6 topics
  // ============================================
  {
    id: 'advanced-1',
    section: 'advanced',
    titleEn: 'Promises',
    titleBg: 'Promise-и',
    descriptionEn: 'Asynchronous programming with promises.',
    descriptionBg: 'Асинхронно програмиране с promise-и.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'advanced-2',
    section: 'advanced',
    titleEn: 'Async/Await',
    titleBg: 'Async/Await',
    descriptionEn: 'Modern async syntax. Working with asynchronous operations.',
    descriptionBg: 'Модерен async синтаксис. Работа с асинхронни операции.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'advanced-3',
    section: 'advanced',
    titleEn: 'Closures',
    titleBg: 'Closures',
    descriptionEn: 'Function scope and closures. Practical applications.',
    descriptionBg: 'Обхват на функции и closures. Практически приложения.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'advanced-4',
    section: 'advanced',
    titleEn: 'Prototypes',
    titleBg: 'Прототипи',
    descriptionEn: 'Prototype chain. Inheritance in JavaScript.',
    descriptionBg: 'Прототипна верига. Наследяване в JavaScript.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'advanced-5',
    section: 'advanced',
    titleEn: 'This Keyword',
    titleBg: 'This ключова дума',
    descriptionEn: 'Context and this. Call, apply, bind methods.',
    descriptionBg: 'Контекст и this. Call, apply, bind методи.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'advanced-6',
    section: 'advanced',
    titleEn: 'Event Loop',
    titleBg: 'Event Loop',
    descriptionEn: 'How JavaScript executes asynchronous code.',
    descriptionBg: 'Как JavaScript изпълнява асинхронен код.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },

  // ============================================
  // OOP - 6 topics
  // ============================================
  {
    id: 'oop-1',
    section: 'oop',
    titleEn: 'Classes',
    titleBg: 'Класове',
    descriptionEn: 'ES6 classes. Constructor and methods.',
    descriptionBg: 'ES6 класове. Конструктор и методи.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'oop-2',
    section: 'oop',
    titleEn: 'Inheritance',
    titleBg: 'Наследяване',
    descriptionEn: 'Extends and super. Class inheritance.',
    descriptionBg: 'Extends и super. Наследяване на класове.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'oop-3',
    section: 'oop',
    titleEn: 'Encapsulation',
    titleBg: 'Енкапсулация',
    descriptionEn: 'Private and public fields. Getters and setters.',
    descriptionBg: 'Частни и публични полета. Getters и setters.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'oop-4',
    section: 'oop',
    titleEn: 'Polymorphism',
    titleBg: 'Полиморфизъм',
    descriptionEn: 'Method overriding. Polymorphic behavior.',
    descriptionBg: 'Презаписване на методи. Полиморфно поведение.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'oop-5',
    section: 'oop',
    titleEn: 'Static Methods',
    titleBg: 'Статични методи',
    descriptionEn: 'Class-level methods and properties.',
    descriptionBg: 'Методи и свойства на ниво клас.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
  },
  {
    id: 'oop-6',
    section: 'oop',
    titleEn: 'Design Patterns',
    titleBg: 'Дизайн шаблони',
    descriptionEn: 'Common OOP patterns in JavaScript.',
    descriptionBg: 'Често срещани ООП шаблони в JavaScript.',
    difficulty: 'advanced',
    estimatedMinutes: 35,
  },

  // ============================================
  // APPLICATIONS - 7 topics
  // ============================================
  {
    id: 'applications-1',
    section: 'applications',
    titleEn: 'Working with API',
    titleBg: 'Работа с API',
    descriptionEn: 'Fetch API. Making HTTP requests.',
    descriptionBg: 'Fetch API. Правене на HTTP заявки.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'applications-2',
    section: 'applications',
    titleEn: 'Local Storage',
    titleBg: 'Local Storage',
    descriptionEn: 'Storing data in the browser.',
    descriptionBg: 'Съхранение на данни в браузъра.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'applications-3',
    section: 'applications',
    titleEn: 'JSON',
    titleBg: 'JSON',
    descriptionEn: 'Working with JSON data. Parse and stringify.',
    descriptionBg: 'Работа с JSON данни. Parse и stringify.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'applications-4',
    section: 'applications',
    titleEn: 'Date and Time',
    titleBg: 'Дата и време',
    descriptionEn: 'Date object. Working with dates.',
    descriptionBg: 'Date обект. Работа с дати.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'applications-5',
    section: 'applications',
    titleEn: 'Regular Expressions',
    titleBg: 'Регулярни изрази',
    descriptionEn: 'Pattern matching and text manipulation.',
    descriptionBg: 'Съпоставяне на шаблони и обработка на текст.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
  },
  {
    id: 'applications-6',
    section: 'applications',
    titleEn: 'Timers',
    titleBg: 'Таймери',
    descriptionEn: 'setTimeout, setInterval. Delayed execution.',
    descriptionBg: 'setTimeout, setInterval. Забавено изпълнение.',
    difficulty: 'beginner',
    estimatedMinutes: 20,
  },
  {
    id: 'applications-7',
    section: 'applications',
    titleEn: 'Browser APIs',
    titleBg: 'Браузър API-та',
    descriptionEn: 'Geolocation, notifications, and other browser APIs.',
    descriptionBg: 'Геолокация, нотификации и други браузър API-та.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },

  // ============================================
  // WEB - 6 topics
  // ============================================
  {
    id: 'web-1',
    section: 'web',
    titleEn: 'DOM Manipulation',
    titleBg: 'DOM манипулация',
    descriptionEn: 'Selecting and modifying HTML elements.',
    descriptionBg: 'Избиране и промяна на HTML елементи.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'web-2',
    section: 'web',
    titleEn: 'Events',
    titleBg: 'Събития',
    descriptionEn: 'Event listeners. Handling user interactions.',
    descriptionBg: 'Event listeners. Обработка на потребителски взаимодействия.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'web-3',
    section: 'web',
    titleEn: 'Forms',
    titleBg: 'Форми',
    descriptionEn: 'Form validation and handling.',
    descriptionBg: 'Валидация и обработка на форми.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
  },
  {
    id: 'web-4',
    section: 'web',
    titleEn: 'Event Delegation',
    titleBg: 'Event делегиране',
    descriptionEn: 'Efficient event handling for dynamic content.',
    descriptionBg: 'Ефективна обработка на събития за динамично съдържание.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
  },
  {
    id: 'web-5',
    section: 'web',
    titleEn: 'AJAX',
    titleBg: 'AJAX',
    descriptionEn: 'Asynchronous requests. XMLHttpRequest.',
    descriptionBg: 'Асинхронни заявки. XMLHttpRequest.',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
  },
  {
    id: 'web-6',
    section: 'web',
    titleEn: 'Web Components',
    titleBg: 'Web компоненти',
    descriptionEn: 'Creating custom HTML elements.',
    descriptionBg: 'Създаване на персонализирани HTML елементи.',
    difficulty: 'advanced',
    estimatedMinutes: 35,
  },
];

async function main() {
  console.log('[SEED] Starting topics seed...');

  // Delete existing topics
  await prisma.topic.deleteMany({});
  console.log('[SEED] Deleted existing topics');

  // Insert all topics
  for (const topic of topics) {
    await prisma.topic.create({
      data: topic,
    });
  }

  console.log(`[SEED] ✓ Inserted ${topics.length} topics`);
  console.log('[SEED] Topics seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[SEED] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
