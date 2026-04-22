import { cn } from "@/lib/utils";

/**
 * Mark: Rhythm — regular vertical ticks on a baseline, 8px cadence.
 */
export function MarkRhythm({
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
      {/* baseline — structure */}
      <line x1="3" y1="17" x2="21" y2="17" strokeWidth={1.5} />
      {/* tall strokes — structure */}
      <line x1="6" y1="6" x2="6" y2="17" strokeWidth={1.5} />
      <line x1="12" y1="6" x2="12" y2="17" strokeWidth={1.5} />
      <line x1="18" y1="6" x2="18" y2="17" strokeWidth={1.5} />
      {/* half-ticks — detail */}
      <line x1="9" y1="13" x2="9" y2="17" strokeWidth={0.5} />
      <line x1="15" y1="13" x2="15" y2="17" strokeWidth={0.5} />
    </svg>
  );
}
