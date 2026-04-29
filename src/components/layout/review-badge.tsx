import Link from "next/link";
import { db } from "@/lib/db";
import { plural } from "@/lib/pluralize";

/**
 * Header badge for spaced-repetition. Renders only when the user has at
 * least one due review — otherwise the layout stays quiet. Counts via a
 * single SELECT COUNT; the row list happens on /review itself.
 *
 * Server component — re-runs on router.refresh after grading, which the
 * ReviewItem triggers, so the count drifts down as the user works through
 * the queue.
 */
export async function ReviewBadge({ userId }: { userId: string }) {
  const count = await db.reviewQueue.count({
    where: { userId, dueAt: { lte: new Date() } },
  });
  if (count <= 0) return null;
  const label = `К повторению ${count} ${plural(count, ["тема", "темы", "тем"])}`;
  return (
    <Link
      href="/review"
      aria-label={label}
      title={label}
      className="inline-flex items-center motion-micro hover:text-cinnabar"
      style={{ gap: "8px" }}
    >
      <span
        aria-hidden
        className="bg-ochre"
        style={{ width: "6px", height: "6px", borderRadius: "50%" }}
      />
      <span className="text-caption text-ink tabular-nums">↻ {count}</span>
    </Link>
  );
}
