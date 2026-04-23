import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, forbidden, unauthorized } from "@/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/submissions/:id — return the submission if owned by the caller.
 * Used by the polling client on the submission form.
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
  const submission = await db.submission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  if (submission.userId !== session.user.id) {
    return forbidden();
  }

  return NextResponse.json({
    id: submission.id,
    status: submission.status,
    feedback: submission.feedback,
    lessonSlug: submission.lessonSlug,
    topicSlug: submission.topicSlug,
    figmaUrl: submission.figmaUrl,
    description: submission.description,
    isPublic: submission.isPublic,
    retryCount: submission.retryCount,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  });
}
