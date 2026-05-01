import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFeedback } from "@/lib/ai/feedback";
import { verifyCronAuth } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retry-cron for FEEDBACK_FAILED submissions — plan §4.6.
 * Authed via verifyCronAuth (Vercel Cron Bearer or legacy x-cron-secret).
 * Picks up rows with retryCount < 3 and re-runs the AI pipeline.
 *
 * Vercel Cron config (vercel.json) hits this every 6 hours.
 */
export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
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
