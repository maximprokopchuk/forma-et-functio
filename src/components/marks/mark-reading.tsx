import { cn } from "@/lib/utils";

/**
 * Mark: Reading — open book / spread with centre fold.
 */
export function MarkReading({
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
      {/* spread — structure */}
      <path d="M4 6 L12 7 L20 6 L20 18 L12 19 L4 18 Z" strokeWidth={1.5} />
      {/* centre fold — structure */}
      <line x1="12" y1="7" x2="12" y2="19" strokeWidth={1.5} />
      {/* text rules — detail */}
      <line x1="6" y1="11" x2="10" y2="11" strokeWidth={0.5} />
      <line x1="14" y1="11" x2="18" y2="11" strokeWidth={0.5} />
      <line x1="6" y1="14" x2="10" y2="14" strokeWidth={0.5} />
      <line x1="14" y1="14" x2="18" y2="14" strokeWidth={0.5} />
    </svg>
  );
}
