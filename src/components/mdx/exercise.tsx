import type { ReactNode } from "react";

/**
 * Exercise — wrapper with ochre 0.5px rules above and below, caption
 * `УПРАЖНЕНИЕ` + title in h3, then children.
 * Used to mark inline interactive exercises (widgets) in the reading flow.
 */
export function Exercise({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <figure
      className="flex flex-col gap-4"
      style={{ marginBlock: "40px" }}
    >
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <div className="flex flex-col gap-2">
        <p className="text-caption text-ochre">Упражнение</p>
        <h3 className="text-h3 text-ink">{title}</h3>
      </div>
      <div>{children}</div>
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
      />
    </figure>
  );
}
