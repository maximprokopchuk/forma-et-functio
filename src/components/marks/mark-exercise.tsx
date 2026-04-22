import { cn } from "@/lib/utils";

/**
 * Mark: Exercise — pencil tip / task mark (diagonal stroke + small tip).
 */
export function MarkExercise({
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
      {/* pencil shaft — structure */}
      <line x1="6" y1="18" x2="16" y2="8" strokeWidth={1.5} />
      <line x1="8" y1="20" x2="18" y2="10" strokeWidth={1.5} />
      {/* nib — structure */}
      <line x1="6" y1="18" x2="8" y2="20" strokeWidth={1.5} />
      {/* ferrule detail — detail */}
      <line x1="15" y1="9" x2="17" y2="11" strokeWidth={0.5} />
      {/* tip mark — detail */}
      <line x1="5" y1="19" x2="4" y2="20" strokeWidth={0.5} />
    </svg>
  );
}
