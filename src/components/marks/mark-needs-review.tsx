import { cn } from "@/lib/utils";

/**
 * Mark: Needs review — circle with a centred exclamation stroke and dot.
 */
export function MarkNeedsReview({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      className={cn(className)}
      role="img"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" strokeWidth={1.5} />
      {/* exclamation stem — structure */}
      <line x1="12" y1="7" x2="12" y2="13" strokeWidth={1.5} />
      {/* dot — detail */}
      <rect x="11.4" y="15.4" width="1.2" height="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
