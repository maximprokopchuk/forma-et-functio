import { cn } from "@/lib/utils";

/**
 * Mark: Typography — capital T sitting on baseline with x-height rule.
 */
export function MarkTypography({
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
      {/* T — structure */}
      <line x1="5" y1="6" x2="19" y2="6" strokeWidth={1.5} />
      <line x1="12" y1="6" x2="12" y2="19" strokeWidth={1.5} />
      {/* baseline — detail */}
      <line x1="3" y1="19" x2="21" y2="19" strokeWidth={0.5} />
      {/* x-height rule — detail */}
      <line x1="3" y1="13" x2="21" y2="13" strokeWidth={0.5} strokeDasharray="1.5 1.5" />
    </svg>
  );
}
