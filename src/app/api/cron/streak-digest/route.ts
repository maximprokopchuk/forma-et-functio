import { NextResponse } from "next/server";
import { sendStreakDigest } from "@/lib/email/streak-digest";
import { verifyCronAuth } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily streak-at-risk digest cron — plan §17.
 * Authed by `x-cron-secret` (matches the retry-submissions pattern). Vercel
 * Cron config in vercel.json hits this once daily at 18:00 UTC, which lands
 * in the late afternoon for Moscow and late morning for the US west coast —
 * a reasonable window before the streak burns at next UTC midnight.
 */
export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin;

  try {
    const result = await sendStreakDigest({ origin });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/streak-digest] failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
