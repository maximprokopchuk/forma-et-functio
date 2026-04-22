import { cn } from "@/lib/utils";

/**
 * Mark: In-progress — circle with a single radius (clock-hand).
 */
export function MarkInProgress({
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
      {/* hour hand — structure */}
      <line x1="12" y1="12" x2="12" y2="6" strokeWidth={1.5} />
      {/* minute hand — detail */}
      <line x1="12" y1="12" x2="16" y2="12" strokeWidth={0.5} />
    </svg>
  );
}
