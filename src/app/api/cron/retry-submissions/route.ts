import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFeedback } from "@/lib/ai/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retry-cron for FEEDBACK_FAILED submissions — plan §4.6.
 * Authed by a shared secret header (`x-cron-secret`) set in Vercel Cron.
 * Picks up rows with retryCount < 3 and re-runs the AI pipeline.
 *
 * Vercel Cron config (vercel.json) should hit this hourly.
 */
export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stale = await db.submission.findMany({
    where: {
      status: "FEEDBACK_FAILED",
      retryCount: { lt: 3 },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const row of stale) {
    try {
      await db.submission.update({
        where: { id: row.id },
        data: { status: "PENDING" },
      });
      await generateFeedback(row.id);
      results.push({ id: row.id, ok: true });
    } catch (err) {
      results.push({
        id: row.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
