import { db } from "@/lib/db";
import { streakStatus } from "@/lib/streak";

/**
 * Streak badge — Duolingo-style loss-aversion device, in editorial register.
 * Three visual states based on `lastStreakDay`:
 *   - today      → full intensity (cinnabar dot)
 *   - yesterday  → at-risk (rule-coloured dot, faded count)
 *   - older/null → not rendered
 *
 * Server component. Reads directly from db so the badge reflects the canonical
 * value at render time without a client round-trip.
 */

export async function StreakBadge({ userId }: { userId: string }) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, lastStreakDay: true },
  });
  if (!user) return null;
  if (user.currentStreak <= 0) return null;
  const status = streakStatus(user.lastStreakDay);
  if (status === "burned") return null;

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
