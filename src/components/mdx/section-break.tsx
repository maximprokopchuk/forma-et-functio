/**
 * SectionBreak — chapter mark in the middle of a topic body.
 * Renders as a paper-breathing device: a dinkus of three centred bullets on
 * a hairline, then a small-caps heading. Reads as a landmark, not a footnote.
 */
export function SectionBreak({ id, label }: { id: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center gap-4"
      style={{ marginBlock: "56px 24px" }}
    >
      <div
        aria-hidden
        className="text-ink-muted"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          letterSpacing: "1em",
          lineHeight: 1,
          paddingLeft: "1em",
        }}
      >
        · · ·
      </div>
      <h2 className="text-caption text-ink">
        § {id} · {label}
      </h2>
    </div>
  );
}
