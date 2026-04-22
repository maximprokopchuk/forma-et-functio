import { cn } from "@/lib/utils";

/**
 * Editorial wordmark — lowercase `forma et functio` with italic cinnabar `et`.
 * Sizes map to the display type scale from plan §16.1.
 */
type WordmarkSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<WordmarkSize, { fontSize: string; lineHeight: string; tracking: string }> = {
  sm: { fontSize: "27px", lineHeight: "36px", tracking: "0" },
  md: { fontSize: "48px", lineHeight: "56px", tracking: "0" },
  lg: { fontSize: "68px", lineHeight: "72px", tracking: "0.01em" },
  xl: { fontSize: "96px", lineHeight: "96px", tracking: "0.02em" },
};

export function Wordmark({
  size = "md",
  className,
}: {
  size?: WordmarkSize;
  className?: string;
}) {
  const { fontSize, lineHeight, tracking } = SIZE_MAP[size];
  return (
    <span
      className={cn("font-display text-ink", className)}
      style={{
        fontSize,
        lineHeight,
        letterSpacing: tracking,
        fontWeight: 400,
      }}
    >
      forma{" "}
      <em
        className="text-cinnabar"
        style={{
          fontStyle: "italic",
          fontSize: "0.82em",
        }}
      >
        et
      </em>{" "}
      functio
    </span>
  );
}

/**
 * F·F ligature — two F letterforms sharing a single horizontal crossbar.
 * At sizes <= 20px the crossbar collapses into a centred dot (the typographic
 * `F·F` rendering, favicon-safe). Rendered in `currentColor` so it can sit
 * inline against any background.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  const compact = size <= 20;
  // 24x24 viewBox, square-cut terminals.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-label="Forma et Functio"
      role="img"
    >
      {/* Left F — vertical stem + top bar */}
      <line x1="5" y1="4" x2="5" y2="20" />
      <line x1="5" y1="4" x2="10" y2="4" />
      {/* Right F — vertical stem + top bar */}
      <line x1="14" y1="4" x2="14" y2="20" />
      <line x1="14" y1="4" x2="19" y2="4" />
      {compact ? (
        // Centred dot replaces the shared crossbar at favicon scale.
        <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      ) : (
        // Shared horizontal crossbar — form follows function as letter-logic.
        <line x1="5" y1="12" x2="19" y2="12" />
      )}
    </svg>
  );
}
