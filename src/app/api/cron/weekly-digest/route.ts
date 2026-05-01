import { NextResponse } from "next/server";
import { sendWeeklyDigest } from "@/lib/email/weekly-digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly summary digest cron — plan §17.
 * Authed via x-cron-secret (matches retry-submissions / streak-digest).
 * Vercel Cron config in vercel.json hits this on Sundays at 09:00 UTC,
 * which lands ~12:00 Moscow / 02:00 US Pacific — Sunday morning for
 * European audience, Saturday late evening for US west.
 */
export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin;

  try {
    const result = await sendWeeklyDigest({ origin });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/weekly-digest] failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
