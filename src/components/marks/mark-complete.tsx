import { cn } from "@/lib/utils";

/**
 * Mark: Complete — circle + square-cut checkmark inside.
 */
export function MarkComplete({
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
      strokeLinejoin="miter"
      className={cn(className)}
      role="img"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" strokeWidth={1.5} />
      {/* check — structure */}
      <polyline points="8,12 11,15 16,9" strokeWidth={1.5} />
    </svg>
  );
}
