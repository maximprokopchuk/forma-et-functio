import { cn } from "@/lib/utils";

/**
 * Mark: Grid — 3x3 module, two columns highlighted as structure, others detail.
 */
export function MarkGrid({
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
      {/* outer frame — structure */}
      <rect x="3" y="3" width="18" height="18" strokeWidth={1.5} />
      {/* dividers — detail */}
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth={0.5} />
      <line x1="15" y1="3" x2="15" y2="21" strokeWidth={0.5} />
      <line x1="3" y1="9" x2="21" y2="9" strokeWidth={0.5} />
      <line x1="3" y1="15" x2="21" y2="15" strokeWidth={0.5} />
    </svg>
  );
}
