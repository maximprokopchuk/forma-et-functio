import { db } from "@/lib/db";

/**
 * Streak badge — Duolingo-style loss-aversion device, in editorial register.
 * Three visual states based on `lastStreakDay`:
 *   - today      → full intensity (cinnabar dot)
 *   - yesterday  → at-risk (rule-coloured dot, faded count)
 *   - older/null → not rendered
 *
 * Server component. Reads directly from db so the badge reflects the canonical
 * value at render time without a client round-trip. The CompleteButton fires
 * a `streak:changed` CustomEvent so a small client wrapper can re-fetch when
 * a topic is marked complete on the same page.
 */

type Status = "today" | "atRisk";

function classify(lastStreakDay: Date | null): Status | null {
  if (!lastStreakDay) return null;
  const dayMs = 24 * 60 * 60_000;
  const today = startOfUTCDay(new Date());
  const last = startOfUTCDay(lastStreakDay);
  const diffDays = Math.round((today.getTime() - last.getTime()) / dayMs);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "atRisk";
  return null;
}

function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function StreakBadge({ userId }: { userId: string }) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, lastStreakDay: true },
  });
  if (!user) return null;
  if (user.currentStreak <= 0) return null;
  const status = classify(user.lastStreakDay);
  if (!status) return null;

  const dotColor = status === "today" ? "bg-cinnabar" : "bg-rule";
  const numColor = status === "today" ? "text-ink" : "text-ink-muted";
  const ariaLabel =
    status === "today"
      ? `Серия ${user.currentStreak} ${plural(user.currentStreak)} — отмечена сегодня`
      : `Серия ${user.currentStreak} ${plural(user.currentStreak)} — может сгореть сегодня, отметьте тему до полуночи UTC`;

  return (
    <span
      aria-label={ariaLabel}
      title={ariaLabel}
      className="inline-flex items-center gap-2 text-caption tabular-nums"
    >
      <span
        aria-hidden
        className={`inline-block ${dotColor}`}
        style={{ width: "6px", height: "6px", borderRadius: "50%" }}
      />
      <span className={numColor}>{user.currentStreak}</span>
    </span>
  );
}

function plural(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  const last = n % 10;
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}
