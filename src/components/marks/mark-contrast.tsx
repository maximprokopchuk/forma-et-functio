import { cn } from "@/lib/utils";

/**
 * Mark: Contrast — a circle split half-filled, half-open (figure-ground pair).
 */
export function MarkContrast({
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
      {/* outer ring — structure */}
      <circle cx="12" cy="12" r="8" strokeWidth={1.5} />
      {/* filled left half — structure */}
      <path d="M12 4 A8 8 0 0 0 12 20 Z" fill="currentColor" stroke="none" />
      {/* central dividing line — detail */}
      <line x1="12" y1="4" x2="12" y2="20" strokeWidth={0.5} />
    </svg>
  );
}
