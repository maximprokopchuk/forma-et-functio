/**
 * Editorial footer — text-caption, muted-ink, 3 columns, hairline rule on top.
 * Commit SHA sits in the right column in mono when provided.
 */
export function Footer() {
  const sha =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    "dev";

  return (
    <footer className="relative mt-auto w-full bg-paper">
      {/* 0.5px hairline — true half-pixel via scaleY transform */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <div className="grid-16 py-8">
        <p className="col-span-full col-start-1 text-caption text-ink-muted md:col-span-5 md:col-start-1 xl:col-span-5 xl:col-start-1">
          © 2026 Forma et Functio
        </p>
        <p
          aria-hidden
          className="hidden md:col-span-2 md:col-start-6 md:block xl:col-span-6 xl:col-start-6"
        />
        <p className="col-span-full col-start-1 text-caption text-ink-muted md:col-span-1 md:col-start-8 md:text-right xl:col-span-5 xl:col-start-12">
          <span className="text-mono" style={{ fontSize: "12px" }}>
            {sha}
          </span>
        </p>
      </div>
    </footer>
  );
}
