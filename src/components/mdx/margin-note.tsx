import type { ReactNode } from "react";

/**
 * MarginNote — Tuftean side note.
 *
 * Desktop (xl+): floats into the right margin column using a negative
 * `margin-right` that pulls the note out of the reading measure. The main
 * column stays at 8 grid cols; the note lives in cols 12-15 of the 16-col
 * editorial grid. Prefaced by a 0.5px rule, italic 13/20 serif.
 *
 * Mobile / tablet: renders inline above the next paragraph, still prefaced
 * by a hairline so the eye sees it as a parenthetical, not a beat in the
 * main flow.
 *
 * Why float not grid? MDX's flat paragraph stream can't cleanly nest nodes
 * into a sibling column without a compile-time transform. Float is the
 * classical editorial solution (newspaper sidebars) and Safari-stable.
 */
export function MarginNote({ children }: { children: ReactNode }) {
  return (
    <aside
      className="mdx-margin-note flex flex-col gap-2"
      style={{ marginBlock: "16px" }}
    >
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
