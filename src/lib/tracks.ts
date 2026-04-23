/**
 * Static track metadata — titles, manifestos, colour tokens.
 * Track metadata lives here, not in the filesystem: there are only ever 4 tracks,
 * and their identity is part of the brand, not the content workflow.
 * Plan §4.1, §2.4.
 */

export type TrackSlug = "foundations" | "interface" | "experience" | "craft";

export type TrackAccent = "cinnabar" | "lapis" | "ochre" | "ink";

export type TrackConfig = {
  title: string;
  shortTitle: string;
  description: string;
  manifesto: string;
  colorToken: TrackAccent;
};

export const TRACKS: Record<TrackSlug, TrackConfig> = {
  foundations: {
    title: "Основы",
    shortTitle: "FOUNDATIONS",
    description:
      "Перцепция, композиция, цвет, типографика, сетка. Фундамент, на котором держится всё остальное.",
    manifesto:
      "Это те инструменты, без которых все последующие решения — случайны. Тут учат видеть: гештальт, иерархию, ритм и масштаб.",
    colorToken: "cinnabar",
  },
  interface: {
    title: "Интерфейсы",
    shortTitle: "INTERFACE",
    description:
      "Компоненты, состояния, системы. HTML и CSS как материал, из которого собирается работающий продукт.",
    manifesto:
      "Интерфейс — это не картинка в Figma, а код, живущий в браузере. Тут учат думать паттернами и состояниями, а не экранами.",
    colorToken: "lapis",
  },
  experience: {
    title: "Опыт",
    shortTitle: "EXPERIENCE",
    description:
      "Исследование, архитектура, тестирование, метрики. Как понять, что именно строить.",
    manifesto:
      "Хороший UX начинается до первого макета — с разговора с пользователем и карты его пути. Тут учат задавать вопросы и интерпретировать ответы.",
    colorToken: "ochre",
  },
  craft: {
    title: "Ремесло",
    shortTitle: "CRAFT",
    description:
      "Motion, прототипы, хэндофф, портфолио, критика, карьера. То, что отделяет любителя от практика.",
    manifesto:
      "Ремесло — это набор маленьких привычек: читабельный хэндофф, аккуратная спека, честная критика. Тут учат профессиональной дисциплине.",
    colorToken: "ink",
  },
};

export const TRACK_SLUGS: TrackSlug[] = [
  "foundations",
  "interface",
  "experience",
  "craft",
];

export function isTrackSlug(value: string): value is TrackSlug {
  return (TRACK_SLUGS as string[]).includes(value);
}
