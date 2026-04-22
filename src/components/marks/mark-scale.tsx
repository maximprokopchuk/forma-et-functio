import { cn } from "@/lib/utils";

/**
 * Mark: Scale — three nested squares showing modular progression.
 */
export function MarkScale({
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
      <rect x="3" y="3" width="18" height="18" strokeWidth={1.5} />
      <rect x="7" y="7" width="10" height="10" strokeWidth={1.5} />
      <rect x="10" y="10" width="4" height="4" strokeWidth={0.5} />
    </svg>
  );
}
