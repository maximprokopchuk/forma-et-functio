import { cn } from "@/lib/utils";

/**
 * Mark: Hierarchy — three descending horizontal strokes representing
 * h1 / h2 / body type-size relationship.
 */
export function MarkHierarchy({
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
      <line x1="4" y1="7" x2="20" y2="7" strokeWidth={1.5} />
      <line x1="4" y1="12" x2="15" y2="12" strokeWidth={1.5} />
      <line x1="4" y1="17" x2="11" y2="17" strokeWidth={0.5} />
    </svg>
  );
}
