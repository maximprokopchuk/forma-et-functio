import { cn } from "@/lib/utils";

/**
 * Mark: Gestalt — proximity / grouping. Three grouped dots separate from one,
 * showing figure-ground emergence.
 */
export function MarkGestalt({
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
      {/* grouped triad — main structure */}
      <circle cx="7" cy="9" r="1.5" strokeWidth={1.5} />
      <circle cx="11" cy="9" r="1.5" strokeWidth={1.5} />
      <circle cx="9" cy="13" r="1.5" strokeWidth={1.5} />
      {/* distant singleton — detail */}
      <circle cx="18" cy="17" r="1.2" strokeWidth={0.5} />
      {/* field boundary — detail */}
      <rect x="3" y="5" width="18" height="14" strokeWidth={0.5} />
    </svg>
  );
}
