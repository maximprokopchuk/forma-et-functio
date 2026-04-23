import type { ReactNode } from "react";

/**
 * MarginNote — Tuftean side note. On desktop (xl+) it sits in cols 12-15 as
 * a floated aside next to the main column; on mobile it renders inline as a
 * italic serif paragraph prefaced by a 0.5px rule.
 *
 * Implementation: we don't use absolute positioning — instead the reading
 * band allocates a margin column and this component renders consistently,
 * with responsive stacking handled by the surrounding grid.
 */
export function MarginNote({ children }: { children: ReactNode }) {
  return (
    <aside className="mdx-margin-note flex flex-col gap-2" style={{ marginBlock: "16px" }}>
      <div
        aria-hidden
        className="h-px w-full bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <p
        className="text-ink-muted"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "13px",
          lineHeight: "20px",
        }}
      >
        {children}
      </p>
    </aside>
  );
}
