/**
 * Shared streak helpers — used by:
 *   - StreakBadge (header)
 *   - Profile page (stats card)
 *   - Streak-digest cron (filter at-risk users)
 *   - POST /api/progress (when computing the next streak day)
 *
 * One canonical implementation, unit-tested below.
 */

export type StreakStatus = "today" | "atRisk" | "burned";

const DAY_MS = 24 * 60 * 60_000;

/** Truncate a Date to the start of its UTC day. */
export function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/**
 * Classify a streak by its last counted day relative to "now".
 *
 *   today    — day already counted today, streak safe
 *   atRisk   — day counted yesterday, streak alive but burns at next UTC midnight
 *   burned   — day older than yesterday (or null), streak dead
 */
export function streakStatus(
  lastStreakDay: Date | null | undefined,
  now: Date = new Date(),
): StreakStatus {
  if (!lastStreakDay) return "burned";
  const today = startOfUTCDay(now);
  const last = startOfUTCDay(lastStreakDay);
  const diff = Math.round((today.getTime() - last.getTime()) / DAY_MS);
  if (diff === 0) return "today";
  if (diff === 1) return "atRisk";
  return "burned";
}

/**
 * Compute the next streak count given the previous count and last counted
 * day. Used in POST /api/progress when a new completion lands.
 *
 *   sameDayAsLast → leave as-is (already counted today)
 *   exactly +1    → increment
 *   anything else → reset to 1
 */
export function nextStreakCount(
  previousCount: number,
  lastStreakDay: Date | null | undefined,
  now: Date = new Date(),
): number {
  if (!lastStreakDay) return 1;
  const today = startOfUTCDay(now);
  const last = startOfUTCDay(lastStreakDay);
  const diff = Math.round((today.getTime() - last.getTime()) / DAY_MS);
  if (diff === 0) return previousCount || 1;
  if (diff === 1) return (previousCount || 0) + 1;
  return 1;
}
