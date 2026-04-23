import type { ReactNode } from "react";

/**
 * DropCap — float-left serif initial, 3-lines tall, cinnabar.
 * Used at the opening paragraph of a topic body.
 */
export function DropCap({ children }: { children: ReactNode }) {
  return (
    <span
      className="float-left mr-3 text-cinnabar"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "84px",
        lineHeight: "72px",
        paddingTop: "6px",
        fontWeight: 400,
      }}
    >
      {children}
    </span>
  );
}
