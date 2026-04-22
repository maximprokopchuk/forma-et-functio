import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { MOCK_TRACKS, type TrackAccent } from "@/lib/mock-data";

/**
 * Homepage — plan §20.1.
 * Two sections: 80vh fold (wordmark + captions) and 4 full-width track rows.
 * No cards, no shadows. Everything on paper.
 */
export default function HomePage() {
  return (
    <>
      <HeroFold />
      <TrackList />
    </>
  );
}

function HeroFold() {
  return (
    <section
      className="grid-16 bg-paper"
      style={{ minHeight: "80vh", paddingBlock: "96px" }}
    >
      {/* Wordmark spans cols 3-14 (12 cols). Centred gravity. */}
      <div className="col-span-full flex flex-col justify-center gap-8 xl:col-span-12 xl:col-start-3">
        <h1 className="flex items-baseline">
          <Wordmark size="xl" className="block leading-none" />
        </h1>

        {/* 0.5px hairline, full measure of the column. */}
        <div
          aria-hidden
          className="h-px w-full bg-rule"
          style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
        />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Tagline, cols 3-10 = 8 inner cols on xl. */}
          <p className="text-body-l text-ink xl:col-span-8">
            Учебник цифрового дизайна — с примерами, которые работают в браузере.
          </p>

          {/* Four tiny captions stacked, cols 12-15 = 4 inner cols on xl. */}
          <div className="flex flex-col gap-2 xl:col-span-4 xl:col-start-10">
            <HeroCaption value="65" label="разделов" />
            <HeroCaption value="4" label="трека" />
            <HeroCaption label="Живые примеры" />
            <HeroCaption label="На русском" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCaption({ value, label }: { value?: string; label: string }) {
  return (
    <span className="text-caption text-ink">
      {value ? (
        <>
          <span className="text-cinnabar tabular-nums">{value}</span> {label}
        </>
      ) : (
        label
      )}
    </span>
  );
}

function TrackList() {
  return (
    <section aria-label="Треки" className="border-t border-rule bg-paper">
      {MOCK_TRACKS.map((track) => (
        <TrackRow
          key={track.slug}
          slug={track.slug}
          shortTitle={track.shortTitle}
          title={track.title}
          description={track.description}
          lessonCount={track.lessonCount}
          hours={track.hours}
          accent={track.accent}
        />
      ))}
    </section>
  );
}

const ACCENT_BG: Record<TrackAccent, string> = {
  cinnabar: "bg-cinnabar",
  lapis: "bg-lapis",
  ochre: "bg-ochre",
  ink: "bg-ink",
};

function TrackRow({
  slug,
  shortTitle,
  title,
  description,
  lessonCount,
  hours,
  accent,
}: {
  slug: string;
  shortTitle: string;
  title: string;
  description: string;
  lessonCount: number;
  hours: number;
  accent: TrackAccent;
}) {
  return (
    <Link
      href={`/lessons/${slug}`}
      className="group relative block border-t border-rule first:border-t-0 motion-small hover:bg-[oklch(0.94_0.01_85)]"
    >
      <article
        className="grid-16 relative"
        style={{ minHeight: "30vh", paddingBlock: "56px" }}
      >
        {/* Col 1-2: 4px colour strip sitting flush against grid origin. */}
        <span
          aria-hidden
          className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BG[accent]}`}
          style={{ left: "80px" }}
        />

        {/* Cols 3-7: title + description. */}
        <div className="col-span-full flex flex-col gap-4 xl:col-span-5 xl:col-start-3">
          <p className="text-caption text-ink-muted">{shortTitle}</p>
          <h2 className="text-display-m text-ink">
            <span className="relative inline-block">
              {title}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 -bottom-1 h-px w-full scale-x-0 origin-left bg-cinnabar motion-small group-hover:scale-x-100"
                style={{ transform: "scaleY(0.5) scaleX(0)", transformOrigin: "left bottom" }}
              />
            </span>
          </h2>
          <p className="text-body text-ink-muted" style={{ maxWidth: "44ch" }}>
            {description}
          </p>
        </div>

        {/* Cols 9-14: lesson count summary. */}
        <div className="col-span-full xl:col-span-6 xl:col-start-9 xl:self-end">
          <p className="text-caption text-ink-muted">
            <span className="text-ink tabular-nums">{lessonCount}</span> разделов{" "}
            · <span className="text-ink tabular-nums">{hours}</span> часов
          </p>
        </div>
      </article>
    </Link>
  );
}
