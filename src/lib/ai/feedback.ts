/**
 * Submission AI feedback pipeline — plan §6.
 * Calls OpenRouter with a rubric-aware prompt, parses a structured JSON response,
 * and persists it on the Submission row. Falls back to a canned mock when
 * OPENROUTER_API_KEY is empty.
 */

import { z } from "zod";
import { generateObject, type ModelMessage } from "ai";
import { db } from "@/lib/db";
import { getRubric, type Rubric } from "@/lib/rubrics";
import { getAIClient, MODEL_FEEDBACK } from "@/lib/ai/client";
import { mockFeedback } from "@/lib/ai/mock";
import { approxTokenCount } from "@/lib/ai/prompts";

export const feedbackSchema = z.object({
  overall_score: z.number().min(1).max(5),
  dimensions: z.array(
    z.object({
      id: z.string().min(1),
      score: z.number().min(1).max(5),
      note: z.string().min(1),
    }),
  ),
  summary: z.string().min(1),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

export type Feedback = z.infer<typeof feedbackSchema>;

function rubricSummary(rubric: Rubric): string {
  const dimensionsText = rubric.dimensions
    .map((d) => {
      const levels = Object.entries(d.levels)
        .map(([score, text]) => `      [${score}] ${text}`)
        .join("\n");
      return [
        `  - id: ${d.id}`,
        `    label: ${d.label}`,
        `    weight: ${d.weight}`,
        `    levels:\n${levels}`,
      ].join("\n");
    })
    .join("\n");

  const refs = rubric.reference_examples
    ? rubric.reference_examples
        .map((ex) => `  - score ${ex.score} (${ex.url}): ${ex.notes}`)
        .join("\n")
    : "  (нет примеров)";

  return ["РУБРИКА:", dimensionsText, "", "ЭТАЛОННЫЕ ПРИМЕРЫ:", refs].join("\n");
}

const RESPONSE_SHAPE = [
  "Верни JSON в формате, указанном схемой:",
  "- overall_score: взвешенное среднее по весам рубрики, округлено к ближайшему целому 1–5.",
  "- dimensions: массив {id, score 1–5, note 1–2 предложения на русском}.",
  "- summary: 2–3 предложения — общий вердикт.",
  "- strengths: 2–4 конкретных сильных места.",
  "- improvements: 2–4 конкретных направления для доработки.",
].join("\n");

const SYSTEM_PROMPT = [
  "Ты — арт-директор, оценивающий студенческую работу по веб-дизайну.",
  "Язык ответа — русский. Регистр редакторский: без восклицаний и эмодзи.",
].join("\n");

/**
 * Text-only prompt — used when no screenshot is attached. Anthropic / OpenAI
 * both accept either `prompt` or `messages` in `generateObject`; keeping the
 * text path on `prompt` minimises diff with the original implementation.
 */
function buildTextPrompt(
  rubric: Rubric,
  submission: {
    description: string;
    figmaUrl: string | null;
  },
): string {
  return [
    SYSTEM_PROMPT,
    "",
    rubricSummary(rubric),
    "",
    "РАБОТА СТУДЕНТА:",
    `- Описание: ${submission.description}`,
    submission.figmaUrl
      ? `- Figma: ${submission.figmaUrl}`
      : "- Figma: не приложен",
    "",
    RESPONSE_SHAPE,
  ].join("\n");
}

/**
 * Multimodal messages — used when the student attached a screenshot. The
 * image is sent as a URL part; the AI SDK passes it through to the provider
 * which fetches the asset from Vercel Blob (public URL).
 */
function buildMultimodalMessages(
  rubric: Rubric,
  submission: {
    description: string;
    figmaUrl: string | null;
    imageUrl: string;
  },
): ModelMessage[] {
  const text = [
    rubricSummary(rubric),
    "",
    "РАБОТА СТУДЕНТА:",
    `- Описание: ${submission.description}`,
    submission.figmaUrl
      ? `- Figma: ${submission.figmaUrl}`
      : "- Figma: не приложен",
    "- Скриншот: приложен ниже. Это первоисточник — оценивай по нему.",
    "",
    RESPONSE_SHAPE,
  ].join("\n");

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: [
        { type: "text", text },
        { type: "image", image: new URL(submission.imageUrl) },
      ],
    },
  ];
}

/**
 * Generate feedback for a submission. On failure: marks the submission
 * FEEDBACK_FAILED and rethrows — caller decides whether to surface or retry.
 */
export async function generateFeedback(submissionId: string): Promise<void> {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  // Resolve rubric from topic (via content layer). Since AI callers usually
  // don't have the TopicMeta here, we accept the rubric from the submission's
  // stored topicSlug by a naive scan — cheap in v1.
  // NB: we pick up the rubric id from topic frontmatter, not from Submission
  // itself. If a topic has no rubric_id, we skip structured feedback.
  const rubricId = await resolveRubricIdForTopic(
    submission.lessonSlug,
    submission.topicSlug,
  );
  if (!rubricId) {
    await db.submission.update({
      where: { id: submissionId },
      data: {
        status: "FEEDBACK_FAILED",
        retryCount: { increment: 1 },
      },
    });
    throw new Error(`No rubric configured for topic ${submission.topicSlug}`);
  }
  const rubric = getRubric(rubricId);
  if (!rubric) {
    await db.submission.update({
      where: { id: submissionId },
      data: {
        status: "FEEDBACK_FAILED",
        retryCount: { increment: 1 },
      },
    });
    throw new Error(`Rubric ${rubricId} not found on disk`);
  }

  const ai = getAIClient();

  try {
    let feedback: Feedback;
    let tokens = 0;
    const modelId = ai.mock ? "mock" : MODEL_FEEDBACK;

    if (ai.mock) {
      feedback = mockFeedback(rubric.dimensions.map((d) => ({ id: d.id })));
      tokens = 0;
    } else if (submission.imageUrl) {
      const messages = buildMultimodalMessages(rubric, {
        description: submission.description,
        figmaUrl: submission.figmaUrl,
        imageUrl: submission.imageUrl,
      });
      const result = await generateObject({
        model: ai.model(MODEL_FEEDBACK),
        schema: feedbackSchema,
        messages,
        maxOutputTokens: 1200,
      });
      feedback = result.object;
      const usage = result.usage;
      // Token approximation skips the image (provider charges per-image
      // tile). The DB count is informational, not billing — close enough.
      const promptText = messages
        .flatMap((m) =>
          typeof m.content === "string"
            ? [m.content]
            : m.content
                .filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text),
        )
        .join("\n");
      tokens =
        (usage?.inputTokens ?? approxTokenCount(promptText)) +
        (usage?.outputTokens ?? approxTokenCount(JSON.stringify(feedback)));
    } else {
      const prompt = buildTextPrompt(rubric, {
        description: submission.description,
        figmaUrl: submission.figmaUrl,
      });
      const result = await generateObject({
        model: ai.model(MODEL_FEEDBACK),
        schema: feedbackSchema,
        prompt,
        maxOutputTokens: 1200,
      });
      feedback = result.object;
      const usage = result.usage;
      tokens =
        (usage?.inputTokens ?? approxTokenCount(prompt)) +
        (usage?.outputTokens ?? approxTokenCount(JSON.stringify(feedback)));
    }

    await db.submission.update({
      where: { id: submissionId },
      data: {
        feedback: JSON.stringify(feedback),
        status: "FEEDBACK_READY",
        feedbackModel: modelId,
        feedbackTokens: tokens,
      },
    });
  } catch (err) {
    await db.submission.update({
      where: { id: submissionId },
      data: {
        status: "FEEDBACK_FAILED",
        retryCount: { increment: 1 },
      },
    });
    throw err;
  }
}

/**
 * Resolve the rubric id for a topic by scanning the content tree. Synchronous
 * read from the filesystem is fine — the content layer is already in-memory
 * after first request.
 */
async function resolveRubricIdForTopic(
  lessonSlug: string,
  topicSlug: string,
): Promise<string | null> {
  // Late-imported to avoid pulling the content module into cold-start paths
  // that don't need it.
  const { getAllTracks, getTopic } = await import("@/lib/content");
  for (const t of getAllTracks()) {
    for (const l of t.lessons) {
      if (l.slug !== lessonSlug) continue;
      if (!l.topics.some((tp) => tp.slug === topicSlug)) continue;
      const topic = getTopic(t.slug, lessonSlug, topicSlug);
      if (topic?.rubricId) return topic.rubricId;
    }
  }
  return null;
}
