/**
 * SectionBreak — small-caps heading `§ 01 · LABEL` used as a chapter mark
 * in the middle of a topic body.
 */
export function SectionBreak({ id, label }: { id: string; label: string }) {
  return (
    <h2
      className="text-caption text-ink"
      style={{ marginBlock: "40px 16px" }}
    >
      § {id} · {label}
    </h2>
  );
}
