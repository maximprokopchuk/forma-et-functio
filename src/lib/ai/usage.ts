/**
 * Daily AI usage caps — plan §11/§18.
 *
 * Two parallel buckets, both day-bucketed in UTC:
 *   chat        — 50 messages / day per user
 *   submissions — 10 submissions / day per user
 *
 * Hard-enforced via DB so a viral spike (10k tweet visitors × 50 prompts =
 * $200-2000/day, plan §25) can't drain the AI budget even if the in-memory
 * rate-limiter is bypassed by fan-out. The model-level token cap
 * (max_tokens) is still in play; this is the orthogonal, per-day signal.
 */

import { db } from "@/lib/db";

export type UsageKind = "chat" | "submission";

export const DAILY_CAPS: Record<UsageKind, number> = {
  chat: 50,
  submission: 10,
};

export type UsageState = {
  kind: UsageKind;
  used: number;
  cap: number;
  remaining: number;
  exceeded: boolean;
};

/** Truncate a Date to the start of its UTC day, as a Date (not ISO). */
function utcDay(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Read current day's count without touching it. Used by callers that want
 * to reject before spending the model token budget.
 */
export async function getUsage(
  userId: string,
  kind: UsageKind,
  now: Date = new Date(),
): Promise<UsageState> {
  const day = utcDay(now);
  const cap = DAILY_CAPS[kind];
  const row = await (kind === "chat"
    ? db.chatUsage.findUnique({ where: { userId_day: { userId, day } } })
    : db.submissionUsage.findUnique({
        where: { userId_day: { userId, day } },
      }));
  const used = row?.messages ?? 0;
  return {
    kind,
    used,
    cap,
    remaining: Math.max(0, cap - used),
    exceeded: used >= cap,
  };
}

/**
 * Increment the day's counter. Pass `tokens` to also record cumulative
 * prompt/completion tokens for cost reporting (plan §11). Idempotent at the
 * row level — upserts on the (userId, day) unique key.
 */
export async function incrementUsage(
  userId: string,
  kind: UsageKind,
  tokens: { promptTokens?: number; completionTokens?: number } = {},
  now: Date = new Date(),
): Promise<void> {
  const day = utcDay(now);
  const data = {
    userId,
    day,
    promptTokens: tokens.promptTokens ?? 0,
    completionTokens: tokens.completionTokens ?? 0,
    messages: 1,
  };
  const update = {
    promptTokens: { increment: tokens.promptTokens ?? 0 },
    completionTokens: { increment: tokens.completionTokens ?? 0 },
    messages: { increment: 1 },
  };
  if (kind === "chat") {
    await db.chatUsage.upsert({
      where: { userId_day: { userId, day } },
      create: data,
      update,
    });
  } else {
    await db.submissionUsage.upsert({
      where: { userId_day: { userId, day } },
      create: data,
      update,
    });
  }
}
