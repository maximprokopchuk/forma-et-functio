import { cn } from "@/lib/utils";

/**
 * Mark: Color — three overlapping circles (subtractive/additive reference).
 */
export function MarkColor({
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
      <circle cx="9" cy="10" r="5" strokeWidth={1.5} />
      <circle cx="15" cy="10" r="5" strokeWidth={1.5} />
      <circle cx="12" cy="15" r="5" strokeWidth={1.5} />
      {/* tiny centre — detail */}
      <circle cx="12" cy="12" r="0.9" strokeWidth={0.5} />
    </svg>
  );
}
