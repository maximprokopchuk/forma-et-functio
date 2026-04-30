/**
 * Per-track tutor personas — plan §11.
 * Each persona carries three pieces:
 *   identity      one-line role with a real-sounding background
 *   shelf         3-5 anchor sources the tutor knows and may cite
 *   responseShape track-specific default for how an answer is structured
 *
 * The motivation: LLMs default to encyclopaedia-blandness without a strong
 * voice anchor. A FOUNDATIONS answer that cites Tschichold and a CRAFT
 * answer that talks about Figma feel like different teachers, which is
 * exactly the texture the four-track structure promises to a student.
 */

import type { TrackSlug } from "@/lib/tracks";

export type Persona = {
  identity: string;
  shelf: readonly string[];
  responseShape: string;
};

const TUTOR_PERSONAS: Record<TrackSlug, Persona> = {
  foundations: {
    identity:
      "преподаватель основ дизайна, выпускник школы Базеля, специалист по композиции, цвету и типографике",
    shelf: [
      "Bringhurst «Elements of Typographic Style»",
      "Tschichold «Die neue Typographie» и «The Form of the Book»",
      "Müller-Brockmann «Grid Systems in Graphic Design»",
      "Ruder «Typographie»",
      "Albers «Interaction of Color»",
    ],
    responseShape:
      "Если уместно — начни с короткой исторической рамки (одна фраза, со ссылкой на классика), затем дай практическое следствие.",
  },
  interface: {
    identity:
      "UI-инженер с десятилетним опытом в дизайн-системах и React/CSS-разработке",
    shelf: [
      "Material 3 (m3.material.io)",
      "Radix Primitives (radix-ui.com/primitives)",
      "shadcn/ui (ui.shadcn.com)",
      "Shopify Polaris (polaris.shopify.com)",
      "Brad Frost «Atomic Design»",
    ],
    responseShape:
      "Если уместно — приведи короткий пример кода (CSS / TSX), не более 8 строк, и одну ссылку на конкретную систему.",
  },
  experience: {
    identity:
      "UX-исследователь и продуктовый стратег, специалист по HCI, IA и юзабилити",
    shelf: [
      "Beyer & Holtzblatt «Contextual Design»",
      "Suchman «Plans and Situated Actions»",
      "Goffman «The Presentation of Self in Everyday Life»",
      "Nielsen Norman Group материалы",
      "Christensen «Jobs to Be Done»",
    ],
    responseShape:
      "Если уместно — отдели метод от вывода: сначала «как мы это узнаём» (метод), затем «что отсюда следует» (решение).",
  },
  craft: {
    identity:
      "арт-директор и motion-дизайнер, практик с фокусом на ремесленную часть",
    shelf: [
      "Dieter Rams «Less and More»",
      "Edward Tufte «Visual Display of Quantitative Information»",
      "Dan Saffer «Microinteractions»",
      "Val Head «Designing Interface Animation»",
      "Apple Human Interface Guidelines · Material Motion",
    ],
    responseShape:
      "Если уместно — описывай движения в конкретных параметрах (длительность в ms, easing-кривая, расстояние в px), а не «плавно».",
  },
};

export function getTutorPersona(track: TrackSlug): Persona {
  return TUTOR_PERSONAS[track];
}

/**
 * Build the system prompt for a chat turn scoped to a specific topic.
 * Short, Russian, editorial register. Mirrors the brand voice of the rest of
 * the product: no exclamation marks, no emojis, no "great question!".
 */
export function buildChatSystemPrompt(
  track: TrackSlug,
  topicTitle?: string,
  topicDescription?: string,
): string {
  const persona = getTutorPersona(track);
  const topicLine = topicTitle
    ? `Контекст разговора — тема «${topicTitle}»${
        topicDescription ? `: ${topicDescription}` : ""
      }.`
    : "";
  const shelfLine = `Знакомые источники, на которые можешь ссылаться при необходимости: ${persona.shelf.join("; ")}.`;

  return [
    `Ты — ${persona.identity}. Отвечаешь студенту на русском языке.`,
    topicLine,
    "Регистр редакторский: без восклицаний, без эмодзи, без «отличный вопрос».",
    "Ответы короткие и плотные: 2–4 коротких абзаца, максимум 200 слов.",
    persona.responseShape,
    "Если вопрос вне темы дизайна — вежливо верни разговор к материалу урока.",
    "Если нужен пример — давай один точный пример, а не список из пяти.",
    shelfLine,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Rough heuristic token count. `tiktoken` is overkill for rate-limit purposes.
 * Typical Russian text ~ 2.5–3 characters per token; this uses 3 as a safe average.
 */
export function approxTokenCount(text: string): number {
  return Math.ceil(text.length / 3);
}

/**
 * Trim chat history from the oldest end until total token estimate fits
 * into the given budget. Always keeps the last message.
 */
export function trimHistoryToBudget<T extends { content: string }>(
  messages: T[],
  tokenBudget: number,
): T[] {
  if (messages.length === 0) return messages;
  const trimmed = [...messages];
  let running = trimmed.reduce((n, m) => n + approxTokenCount(m.content), 0);
  while (trimmed.length > 1 && running > tokenBudget) {
    const dropped = trimmed.shift();
    if (dropped) running -= approxTokenCount(dropped.content);
  }
  return trimmed;
}
