/**
 * FigureDidactic — large centred image with a small-caps caption below.
 * Used for historical reproductions, diagrams, or specimens.
 */
export function FigureDidactic({
  src,
  caption,
  alt,
}: {
  src: string;
  caption: string;
  alt?: string;
}) {
  return (
    <figure
      className="flex flex-col items-center gap-3"
      style={{ marginBlock: "40px" }}
    >
      {/* Native <img> used so MDX authors can drop any path without next/image config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? caption}
        loading="lazy"
        decoding="async"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <figcaption className="text-caption text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
