import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/submissions/:id/like — toggle a like on a public submission.
 * Self-likes are rejected (your own work doesn't count toward social proof).
 * Like row create/delete and the denormalised counter on Submission move
 * together inside one transaction so the gallery can read `likesCount`
 * without joining.
 *
 * Returns the new state so the client can drop optimistic updates.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const rl = rateLimit(`likes:${session.user.id}`, 60, 60_000); // 60/min
  if (!rl.success) {
    return NextResponse.json(
      { error: "Слишком много действий, подождите минуту" },
      { status: 429 },
    );
  }

  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const submission = await db.submission.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      isPublic: true,
      status: true,
    },
  });
  if (!submission || !submission.isPublic || submission.status !== "FEEDBACK_READY") {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.userId === session.user.id) {
    return NextResponse.json(
      { error: "Нельзя лайкать свою работу" },
      { status: 403 },
    );
  }

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.submissionLike.findUnique({
      where: {
        userId_submissionId: {
          userId: session.user.id,
          submissionId: submission.id,
        },
      },
    });
    if (existing) {
      await tx.submissionLike.delete({
        where: {
          userId_submissionId: {
            userId: session.user.id,
            submissionId: submission.id,
          },
        },
      });
      const updated = await tx.submission.update({
        where: { id: submission.id },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });
      return { liked: false, count: Math.max(0, updated.likesCount) };
    }
    await tx.submissionLike.create({
      data: {
        userId: session.user.id,
        submissionId: submission.id,
      },
    });
    const updated = await tx.submission.update({
      where: { id: submission.id },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });
    return { liked: true, count: updated.likesCount };
  });

  return NextResponse.json(result);
}

/**
 * GET /api/submissions/:id/like — current state for the calling user. Used by
 * the LikeButton on first mount before any optimistic interaction.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [submission, like] = await Promise.all([
    db.submission.findUnique({
      where: { id },
      select: { likesCount: true },
    }),
    db.submissionLike.findUnique({
      where: {
        userId_submissionId: {
          userId: session.user.id,
          submissionId: id,
        },
      },
      select: { userId: true },
    }),
  ]);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    liked: Boolean(like),
    count: submission.likesCount,
  });
}
