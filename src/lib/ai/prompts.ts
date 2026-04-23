/**
 * Per-track tutor personas — plan §11.
 * Small, deliberate system prompts that anchor the LLM register.
 */

import type { TrackSlug } from "@/lib/tracks";

const TUTOR_PERSONAS: Record<TrackSlug, string> = {
  foundations:
    "преподаватель основ дизайна, специалист по композиции, цвету и типографике",
  interface:
    "UI-дизайнер с десятилетним опытом в дизайн-системах и веб-интерфейсах",
  experience:
    "UX-исследователь, знаток HCI, информационной архитектуры и юзабилити",
  craft:
    "арт-директор и motion-дизайнер, специалист по ремесленной части дизайна",
};

export function getTutorPersona(track: TrackSlug): string {
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

  return [
    `Ты — ${persona}. Отвечаешь студенту на русском языке.`,
    topicLine,
    "Регистр редакторский: без восклицаний, без эмодзи, без «отличный вопрос».",
    "Ответы короткие и плотные: 2–4 коротких абзаца, максимум 200 слов.",
    "Если вопрос вне темы дизайна — вежливо верни разговор к материалу урока.",
    "Если нужен пример — давай один точный пример, а не список из пяти.",
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
