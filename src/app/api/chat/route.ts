import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import type { ModelMessage } from "ai";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getAllTracks, getTopic } from "@/lib/content";
import {
  buildChatSystemPrompt,
  approxTokenCount,
  trimHistoryToBudget,
} from "@/lib/ai/prompts";
import { getAIClient, MODEL_CHAT } from "@/lib/ai/client";
import { mockChatStream } from "@/lib/ai/mock";
import type { TrackSlug } from "@/lib/tracks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9-]+$/;
const chatBodySchema = z.object({
  lessonSlug: z.string().min(1).max(100).regex(slugRe),
  topicSlug: z.string().min(1).max(100).regex(slugRe),
  message: z.string().trim().min(1).max(2000),
});

const CONTEXT_BUDGET_TOKENS = 4000;
const MAX_OUTPUT_TOKENS = 800;

/**
 * GET — chat history for the current user scoped to a lesson+topic.
 * Filters out PENDING/FAILED messages (orphaned placeholders from the
 * bug-fix in §11 are invisible to the UI).
 */
export async function GET(req: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const lessonSlug = searchParams.get("lessonSlug");
  const topicSlug = searchParams.get("topicSlug");
  if (!lessonSlug || !topicSlug) {
    return NextResponse.json(
      { error: "lessonSlug и topicSlug обязательны" },
      { status: 400 },
    );
  }

  const messages = await db.chatMessage.findMany({
    where: {
      userId: session.user.id,
      lessonSlug,
      topicSlug,
      status: { in: ["COMPLETE", "STREAMING"] },
    },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

/**
 * POST — stream a tutor response.
 *
 * Plan §11 three-part bug-fix:
 *   (a) User + assistant rows persisted in ONE transaction, assistant PENDING.
 *   (b) `streamText({ abortSignal })` — stream aborts on client disconnect.
 *   (c) ReadableStream.start() persists full response on finish,
 *       ReadableStream.cancel() persists partial content when client drops.
 *
 * If OPENROUTER_API_KEY is unset the route streams a canned mock reply.
 */
export async function POST(req: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }
  const userId = session.user.id;

  // --- Rate limits. User and IP both capped — stops one abusive IP rotating
  //     accounts and one logged-in account from blowing the daily budget.
  const userLimit = rateLimit(`chat:${userId}`, 20, 60_000);
  if (!userLimit.success) {
    return NextResponse.json(
      { error: "Слишком много сообщений. Подождите минуту." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(userLimit.retryAfterMs / 1000)),
        },
      },
    );
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipLimit = rateLimit(`chat-ip:${ip}`, 40, 60_000);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Слишком много запросов с этого адреса" },
      { status: 429 },
    );
  }

  // --- Parse body
  let parsed;
  try {
    parsed = chatBodySchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }
  const { lessonSlug, topicSlug, message } = parsed;

  // --- Locate the topic and its track (for the persona)
  const allTracks = getAllTracks();
  let trackSlug: TrackSlug | null = null;
  let topicTitle: string | undefined;
  let topicDescription: string | undefined;
  outer: for (const t of allTracks) {
    for (const l of t.lessons) {
      if (l.slug !== lessonSlug) continue;
      const tp = l.topics.find((x) => x.slug === topicSlug);
      if (tp) {
        trackSlug = t.slug;
        topicTitle = tp.title;
        topicDescription = tp.description;
        break outer;
      }
    }
  }
  if (!trackSlug) {
    // Try loading the topic directly — `getTopic` has the track in its path.
    // If that fails, it really doesn't exist.
    for (const t of allTracks) {
      const topic = getTopic(t.slug, lessonSlug, topicSlug);
      if (topic) {
        trackSlug = t.slug;
        topicTitle = topic.title;
        topicDescription = topic.description;
        break;
      }
    }
  }
  if (!trackSlug) {
    return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
  }

  // --- History for context, filtering to COMPLETE only (PENDING/FAILED stay invisible)
  const historyRows = await db.chatMessage.findMany({
    where: {
      userId,
      lessonSlug,
      topicSlug,
      status: "COMPLETE",
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const history: Array<{ role: "user" | "assistant"; content: string }> =
    historyRows.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  // --- Plan §11 (a): persist both rows in one transaction. Assistant is PENDING
  //     so the GET filter will hide it until the stream completes (or it gets
  //     promoted to COMPLETE/FAILED below).
  const systemPrompt = buildChatSystemPrompt(
    trackSlug,
    topicTitle,
    topicDescription,
  );
  const [, assistantMsg] = await db.$transaction([
    db.chatMessage.create({
      data: {
        userId,
        lessonSlug,
        topicSlug,
        role: "user",
        content: message,
        status: "COMPLETE",
      },
    }),
    db.chatMessage.create({
      data: {
        userId,
        lessonSlug,
        topicSlug,
        role: "assistant",
        content: "",
        status: "PENDING",
      },
    }),
  ]);

  // --- Fit history + new user turn into the context budget
  const trimmed = trimHistoryToBudget(
    [...history, { role: "user" as const, content: message }],
    CONTEXT_BUDGET_TOKENS,
  );

  const modelMessages: ModelMessage[] = trimmed.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // --- Prepare client-disconnect signal. We wire it into streamText so the
  //     upstream call tears down cleanly when the browser navigates away.
  const abortController = new AbortController();
  req.signal.addEventListener(
    "abort",
    () => {
      abortController.abort();
    },
    { once: true },
  );

  const encoder = new TextEncoder();
  const ai = getAIClient();

  // Accumulator owned by the ReadableStream so both start() and cancel() see it.
  let fullResponse = "";
  let promptTokensEstimate = approxTokenCount(
    systemPrompt + modelMessages.map((m) => m.content).join("\n"),
  );
  // Latch — both start()'s error handler and cancel() can race. We want the
  // assistant row to be finalized exactly once.
  let finalized = false;

  /**
   * Persist the assistant row at terminal state — called by start() on success,
   * cancel() on client disconnect, and catch() on error.
   */
  async function finalize(outcome: "complete" | "failed" | "cancelled") {
    if (finalized) return;
    finalized = true;
    const status =
      outcome === "cancelled"
        ? fullResponse
          ? "COMPLETE"
          : "FAILED"
        : outcome === "failed"
          ? fullResponse
            ? "COMPLETE"
            : "FAILED"
          : "COMPLETE";

    try {
      await db.chatMessage.update({
        where: { id: assistantMsg.id },
        data: { content: fullResponse, status },
      });
    } catch (err) {
      // Best-effort. Never throw from finalize — we might be called inside
      // a stream error handler already unwinding.
      console.error("[chat] failed to finalize assistant row:", err);
    }

    // Track usage (best-effort). Approximate — real provider token counts are
    // not available in the stream path consistently.
    try {
      const completionTokens = approxTokenCount(fullResponse);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      await db.chatUsage.upsert({
        where: { userId_day: { userId, day: today } },
        create: {
          userId,
          day: today,
          promptTokens: promptTokensEstimate,
          completionTokens,
          messages: 1,
        },
        update: {
          promptTokens: { increment: promptTokensEstimate },
          completionTokens: { increment: completionTokens },
          messages: { increment: 1 },
        },
      });
    } catch (err) {
      console.error("[chat] failed to record usage:", err);
    }
  }

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (ai.mock) {
          for await (const chunk of mockChatStream(abortController.signal)) {
            if (!chunk) continue;
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          const result = streamText({
            model: ai.model(MODEL_CHAT),
            system: systemPrompt,
            messages: modelMessages,
            abortSignal: abortController.signal,
            // Hard cap on cost per single reply.
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          });

          for await (const delta of result.textStream) {
            if (!delta) continue;
            fullResponse += delta;
            controller.enqueue(encoder.encode(delta));
          }

          // Refine token estimates with provider-reported usage when available.
          try {
            const usage = await result.usage;
            if (typeof usage?.inputTokens === "number") {
              promptTokensEstimate = usage.inputTokens;
            }
          } catch {
            // Fall through to heuristic.
          }
        }

        await finalize("complete");
        controller.close();
      } catch (err) {
        // If the AbortController fired because the client dropped, cancel()
        // will handle persistence. Otherwise this is a real error.
        if (abortController.signal.aborted) {
          await finalize("cancelled");
        } else {
          await finalize("failed");
        }
        try {
          controller.error(err);
        } catch {
          // controller already closed — nothing to do.
        }
      }
    },
    async cancel() {
      // Plan §11 (b): client disconnected. Save whatever we have.
      abortController.abort();
      await finalize("cancelled");
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-Assistant-Message-Id": assistantMsg.id,
    },
  });
}
