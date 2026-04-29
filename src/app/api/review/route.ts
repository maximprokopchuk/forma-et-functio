import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { getAllTracks } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/review — items due now (or earlier) for the current user, with
 * topic title + track resolved from the content tree so the /review page
 * can render rows and deep-link without a second client round-trip.
 *
 * Strength is included so the UI can show "повторение Nth раз" hints.
 */
export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const now = new Date();
  const rows = await db.reviewQueue.findMany({
    where: {
      userId: session.user.id,
      dueAt: { lte: now },
    },
    orderBy: { dueAt: "asc" },
    take: 50,
    select: {
      id: true,
      topicSlug: true,
      lessonSlug: true,
      dueAt: true,
      strength: true,
    },
  });

  // Resolve titles via the in-memory content tree.
  const tracks = getAllTracks();
  const items = rows
    .map((row) => {
      for (const t of tracks) {
        for (const l of t.lessons) {
          if (l.slug !== row.lessonSlug) continue;
          const topic = l.topics.find((tp) => tp.slug === row.topicSlug);
          if (!topic) continue;
          return {
            id: row.id,
            trackSlug: t.slug,
            trackTitle: t.title,
            lessonSlug: row.lessonSlug,
            topicSlug: row.topicSlug,
            topicTitle: topic.title,
            dueAt: row.dueAt.toISOString(),
            strength: row.strength,
          };
        }
      }
      // Topic was removed from content; surface anyway so the user can
      // forget the row from the UI.
      return {
        id: row.id,
        trackSlug: null,
        trackTitle: null,
        lessonSlug: row.lessonSlug,
        topicSlug: row.topicSlug,
        topicTitle: row.topicSlug,
        dueAt: row.dueAt.toISOString(),
        strength: row.strength,
      };
    });

  return NextResponse.json({ count: items.length, items });
}
