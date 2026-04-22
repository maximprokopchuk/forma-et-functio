/**
 * Mock data for Phase 1 scaffolding. Real content pipeline arrives in Phase 2
 * via MDX + Fumadocs + Zod-validated frontmatter (plan §9).
 */

export type TrackSlug = "foundations" | "interface" | "experience" | "craft";

export type TrackAccent = "cinnabar" | "lapis" | "ochre" | "ink";

export type MockTrack = {
  slug: TrackSlug;
  title: string;
  shortTitle: string;
  description: string;
  manifesto: string;
  accent: TrackAccent;
  lessonCount: number;
  hours: number;
};

export type MockLesson = {
  order: number;
  slug: string;
  title: string;
  description: string;
  minutes: number;
  level: "L1" | "L2" | "L3" | "L4" | "L5";
  progress: number; // 0–100 — mock completion percentage
};

export const MOCK_TRACKS: readonly MockTrack[] = [
  {
    slug: "foundations",
    title: "Основы",
    shortTitle: "FOUNDATIONS",
    description:
      "Перцепция, композиция, цвет, типографика, сетка. Фундамент, на котором держится всё остальное.",
    manifesto:
      "Чтобы дизайнить современный веб-интерфейс, нужно понимать, чем отличается гештальт от иерархии, и почему 8px-сетка важнее, чем модный цвет года. Этот трек — об инструментах видеть.",
    accent: "cinnabar",
    lessonCount: 15,
    hours: 30,
  },
  {
    slug: "interface",
    title: "Интерфейсы",
    shortTitle: "INTERFACE",
    description:
      "Компоненты, состояния, системы. HTML и CSS как материал — из которого собирается работающий продукт.",
    manifesto:
      "Интерфейс — это не мокап в Figma, а код, который живёт в браузере. Этот трек учит думать паттернами, состояниями и дизайн-системой, а не экранами.",
    accent: "lapis",
    lessonCount: 25,
    hours: 50,
  },
  {
    slug: "experience",
    title: "Опыт",
    shortTitle: "EXPERIENCE",
    description:
      "Исследование, архитектура, тестирование, метрики. Как понять, что именно строить.",
    manifesto:
      "Хороший UX начинается до первого макета — с разговора с пользователем и карты его пути. Этот трек учит задавать вопросы и интерпретировать ответы.",
    accent: "ochre",
    lessonCount: 15,
    hours: 40,
  },
  {
    slug: "craft",
    title: "Ремесло",
    shortTitle: "CRAFT",
    description:
      "Motion, прототипы, хэндофф, портфолио, критика, карьера. То, что отделяет любителя от практика.",
    manifesto:
      "Ремесло — это набор маленьких привычек: читабельный хэндофф, аккуратная спека, честная критика. Этот трек — про профессиональную дисциплину.",
    accent: "ink",
    lessonCount: 10,
    hours: 30,
  },
] as const;

const LESSONS_BY_TRACK: Record<TrackSlug, MockLesson[]> = {
  foundations: [
    {
      order: 1,
      slug: "what-is-design",
      title: "Что такое дизайн",
      description: "От Bauhaus до iPhone: функция, форма и честность материала.",
      minutes: 14,
      level: "L1",
      progress: 100,
    },
    {
      order: 2,
      slug: "perception-gestalt",
      title: "Перцепция и гештальт",
      description: "Как глаз группирует: близость, сходство, замыкание.",
      minutes: 18,
      level: "L2",
      progress: 60,
    },
    {
      order: 3,
      slug: "hierarchy-scale",
      title: "Иерархия и масштаб",
      description: "Размер, вес, цвет, позиция — как вести взгляд.",
      minutes: 16,
      level: "L3",
      progress: 25,
    },
    {
      order: 4,
      slug: "composition-grids",
      title: "Композиция и сетки",
      description: "8pt-baseline, container queries, subgrid — без магии.",
      minutes: 22,
      level: "L3",
      progress: 0,
    },
    {
      order: 5,
      slug: "color-systems",
      title: "Цвет: системы",
      description: "RGB, HSL, OKLCH — и почему последний побеждает.",
      minutes: 20,
      level: "L4",
      progress: 0,
    },
  ],
  interface: [
    {
      order: 1,
      slug: "atomic-design",
      title: "Atomic Design и его границы",
      description: "Где метод работает, а где мешает — честный разбор.",
      minutes: 12,
      level: "L2",
      progress: 0,
    },
    {
      order: 2,
      slug: "buttons",
      title: "Кнопки",
      description: "Состояния, размеры, иерархия действий в одной форме.",
      minutes: 14,
      level: "L2",
      progress: 40,
    },
    {
      order: 3,
      slug: "forms",
      title: "Формы и инпуты",
      description: "Валидация, лейблы, ошибки — от клика до submit.",
      minutes: 22,
      level: "L3",
      progress: 10,
    },
    {
      order: 4,
      slug: "tables",
      title: "Таблицы данных",
      description: "Сортировка, фильтры, плотность — где начинается UX данных.",
      minutes: 18,
      level: "L3",
      progress: 0,
    },
    {
      order: 5,
      slug: "motion-in-ui",
      title: "Motion в UI",
      description: "Когда анимация помогает, а когда отвлекает.",
      minutes: 16,
      level: "L4",
      progress: 0,
    },
  ],
  experience: [
    {
      order: 1,
      slug: "research-interviews",
      title: "Интервью с пользователями",
      description: "Как задавать вопросы, чтобы получить не то, что хотите услышать.",
      minutes: 20,
      level: "L3",
      progress: 100,
    },
    {
      order: 2,
      slug: "usability-testing",
      title: "Usability-тестирование",
      description: "Модерируемое и немодерируемое — когда что использовать.",
      minutes: 18,
      level: "L3",
      progress: 50,
    },
    {
      order: 3,
      slug: "information-architecture",
      title: "Информационная архитектура",
      description: "Ментальные модели и навигационные паттерны.",
      minutes: 24,
      level: "L4",
      progress: 0,
    },
    {
      order: 4,
      slug: "journey-maps",
      title: "Карты пути пользователя",
      description: "Как превратить интервью в артефакт, по которому можно дизайнить.",
      minutes: 16,
      level: "L3",
      progress: 0,
    },
    {
      order: 5,
      slug: "accessibility-wcag",
      title: "Доступность: WCAG 2.2",
      description: "Практический разбор — от фокуса до когнитивной доступности.",
      minutes: 22,
      level: "L4",
      progress: 0,
    },
  ],
  craft: [
    {
      order: 1,
      slug: "figma-advanced",
      title: "Figma: продвинутый уровень",
      description: "Переменные, интерактивные компоненты, авто-лейаут.",
      minutes: 20,
      level: "L3",
      progress: 30,
    },
    {
      order: 2,
      slug: "handoff",
      title: "Хэндофф разработчикам",
      description: "Спеки, токены, версионирование — как не ругаться с командой.",
      minutes: 14,
      level: "L3",
      progress: 0,
    },
    {
      order: 3,
      slug: "portfolio",
      title: "Портфолио: структура кейса",
      description: "Как рассказать историю проекта, а не показать скриншоты.",
      minutes: 18,
      level: "L3",
      progress: 0,
    },
    {
      order: 4,
      slug: "critique",
      title: "Критика: давать и принимать",
      description: "Фреймворк SBI и как делать ревью без травм.",
      minutes: 12,
      level: "L2",
      progress: 0,
    },
    {
      order: 5,
      slug: "interviews",
      title: "Собеседования и whiteboard",
      description: "Как разобрать задачу вслух — и показать процесс, а не ответ.",
      minutes: 16,
      level: "L4",
      progress: 0,
    },
  ],
};

export function getMockTrack(slug: string): MockTrack | null {
  return MOCK_TRACKS.find((t) => t.slug === slug) ?? null;
}

export function getMockLessons(slug: string): MockLesson[] {
  return LESSONS_BY_TRACK[slug as TrackSlug] ?? [];
}
