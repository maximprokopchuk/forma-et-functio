import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { getUsage } from "@/lib/ai/usage";
import { generateFeedback } from "@/lib/ai/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9-]+$/;
// Vercel Blob public URLs follow this pattern; restricting accept stops us
// embedding arbitrary remote images in the AI prompt or gallery.
const blobUrlRe =
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s]+$/i;
const submissionBodySchema = z.object({
  lessonSlug: z.string().min(1).max(100).regex(slugRe),
  topicSlug: z.string().min(1).max(100).regex(slugRe),
  figmaUrl: z
    .string()
    .trim()
    .max(500)
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .regex(blobUrlRe, "imageUrl должен быть Vercel Blob URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  challengeId: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9]+$/i, "challengeId — cuid")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: z.string().trim().min(1).max(1000),
  isPublic: z.boolean().default(false),
});

/**
 * POST /api/submissions — create a submission. Returns 201 with { id }.
 * The AI feedback pipeline runs in the background; clients poll GET /:id.
 */
export async function POST(req: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  // Daily DB-backed cap (plan §11/§18). Replaces the in-memory per-hour
  // limiter — DB-tracking survives across deploys and shards.
  const usage = await getUsage(session.user.id, "submission");
  if (usage.exceeded) {
    return NextResponse.json(
      {
        error: `Дневной лимит проверок исчерпан (${usage.cap}). Сбросится в полночь UTC.`,
      },
      { status: 429 },
    );
  }

  let body;
  try {
    body = submissionBodySchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  // If a challengeId is supplied, validate it points at a PUBLISHED row.
  // DRAFT and ARCHIVED challenges silently drop the link — never reject the
  // submission outright; the user's work is still graded against the topic.
  let validChallengeId: string | null = null;
  if (body.challengeId) {
    const challenge = await db.challenge.findUnique({
      where: { id: body.challengeId },
      select: { id: true, status: true, endsAt: true },
    });
    if (challenge && challenge.status === "PUBLISHED" && challenge.endsAt > new Date()) {
      validChallengeId = challenge.id;
    }
  }

  const submission = await db.submission.create({
    data: {
      userId: session.user.id,
      lessonSlug: body.lessonSlug,
      topicSlug: body.topicSlug,
      challengeId: validChallengeId,
      figmaUrl: body.figmaUrl ?? null,
      imageUrl: body.imageUrl ?? null,
      description: body.description,
      isPublic: body.isPublic,
      status: "PENDING",
    },
  });

  // Fire-and-forget AI feedback. We don't await; client polls GET :id.
  // Errors are swallowed here — they live on the row as FEEDBACK_FAILED.
  void generateFeedback(submission.id).catch((err) => {
    console.error(`[submissions] feedback failed for ${submission.id}:`, err);
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
