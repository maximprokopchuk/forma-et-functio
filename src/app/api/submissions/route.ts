import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";
import { generateFeedback } from "@/lib/ai/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9-]+$/;
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

  const rl = rateLimit(`submissions:${session.user.id}`, 10, 60 * 60_000); // 10/hr
  if (!rl.success) {
    return NextResponse.json(
      { error: "Лимит submissions за час исчерпан" },
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

  const submission = await db.submission.create({
    data: {
      userId: session.user.id,
      lessonSlug: body.lessonSlug,
      topicSlug: body.topicSlug,
      figmaUrl: body.figmaUrl ?? null,
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
