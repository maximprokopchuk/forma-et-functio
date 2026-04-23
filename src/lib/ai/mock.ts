/**
 * Mock AI helpers — used when OPENROUTER_API_KEY is unset so the chat and
 * submission-feedback features stay demo-able without a real key.
 */

const MOCK_CHAT_REPLY = [
  "Хороший вопрос. Разберём по шагам.",
  "",
  "Когда мы говорим об иерархии, речь идёт не о размере шрифта как такового,",
  "а о разнице между соседними уровнями. Глаз читает контраст, не абсолютные",
  "значения: 24/16 выглядит иерархичнее, чем 28/20, хотя разница ровно такая же.",
  "",
  "Попробуйте следующее: возьмите вашу страницу, уменьшите все заголовки на",
  "шаг по модульной шкале и посмотрите, держится ли читаемость. Если да —",
  "исходный масштаб был избыточным. Если падает — ищите другие ручки: вес,",
  "пространство, цвет.",
  "",
  "Главное помнить: иерархия — это про отношения, не про абсолюты.",
].join(" ");

/**
 * Async generator that yields the canned reply word-by-word with tiny delays,
 * simulating a real streaming model. Respects the passed AbortSignal so a
 * client disconnect aborts cleanly.
 */
export async function* mockChatStream(
  abortSignal?: AbortSignal,
): AsyncGenerator<string, void, void> {
  const words = MOCK_CHAT_REPLY.split(/(\s+)/);
  for (const word of words) {
    if (abortSignal?.aborted) return;
    yield word;
    // Small jitter, similar to real streaming cadence.
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
}

/**
 * Mock feedback object matching the feedback schema. Values are plausible
 * but deterministic — good enough for UI development.
 */
export function mockFeedback(dimensions: Array<{ id: string }>): {
  overall_score: number;
  dimensions: Array<{ id: string; score: number; note: string }>;
  summary: string;
  strengths: string[];
  improvements: string[];
} {
  return {
    overall_score: 3,
    dimensions: dimensions.map((d, i) => ({
      id: d.id,
      score: 3 + ((i % 2) as number),
      note: "Оценка сгенерирована в демо-режиме (без реального ключа OpenRouter).",
    })),
    summary:
      "Работа читается, иерархия прослеживается. Есть над чем поработать в выравнивании и контрасте, но базовая структура стоит на своих местах.",
    strengths: [
      "Чёткая основная ось внимания — главный заголовок не теряется.",
      "Текст имеет комфортную меру чтения.",
    ],
    improvements: [
      "Уменьшить размер вторичного CTA — он конкурирует с основным.",
      "Подтянуть межабзацные интервалы к baseline 8px.",
      "Проверить контраст светло-серой подписи на paper-фоне — ближе к границе WCAG AA.",
    ],
  };
}
