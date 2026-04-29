import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9-]+$/;
const bodySchema = z.object({ remembered: z.boolean() });

/**
 * Spaced-repetition curve. Strength advances on "помню", resets on "не
 * помню". Intervals roughly track an SM-2-lite ladder; the exact numbers
 * don't matter much in v1, the property that does is "wrong answers come
 * back fast, right answers stretch out".
 */
const NEXT_DUE_DAYS: Record<number, number> = {
  0: 1,
  1: 3,
  2: 7,
  3: 14,
  4: 30,
  5: 60,
  6: 120,
  7: 240,
};

/**
 * POST /api/review/:topicSlug — body { remembered: boolean }.
 * "помню" → strength + 1 (capped at 7), dueAt += interval.
 * "не помню" → strength = 0, dueAt = tomorrow.
 *
 * Returns the new state so the UI can drop the row from the list.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ topicSlug: string }> },
) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const { topicSlug } = await params;
  if (!slugRe.test(topicSlug)) {
    return NextResponse.json({ error: "Invalid topic slug" }, { status: 400 });
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await db.reviewQueue.findUnique({
    where: {
      userId_topicSlug: {
        userId: session.user.id,
        topicSlug,
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not in queue" }, { status: 404 });
  }

  const newStrength = body.remembered
    ? Math.min(7, existing.strength + 1)
    : 0;
  const days = NEXT_DUE_DAYS[newStrength] ?? 1;
  const dueAt = new Date(Date.now() + days * 24 * 60 * 60_000);

  const updated = await db.reviewQueue.update({
    where: {
      userId_topicSlug: {
        userId: session.user.id,
        topicSlug,
      },
    },
    data: { strength: newStrength, dueAt },
    select: { strength: true, dueAt: true },
  });

  return NextResponse.json({
    strength: updated.strength,
    dueAt: updated.dueAt.toISOString(),
  });
}
