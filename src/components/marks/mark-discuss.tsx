import { cn } from "@/lib/utils";

/**
 * Mark: Discuss — two overlapping dialogue rectangles.
 */
export function MarkDiscuss({
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
      {/* back bubble — structure */}
      <path d="M4 5 H16 V14 H10 L6 18 V14 H4 Z" strokeWidth={1.5} />
      {/* front bubble — detail */}
      <path d="M10 9 H20 V16 H14 L12 19 V16 H10 Z" strokeWidth={0.5} />
    </svg>
  );
}
