import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { getAllTracks, getTrackStats } from "@/lib/content";
import type { TrackAccent } from "@/lib/tracks";

/**
 * Homepage — plan §20.1.
 * Two sections: 80vh fold (wordmark + captions) and 4 full-width track rows.
 * No cards, no shadows. Everything on paper.
 * Track stats ("X разделов · Y часов") are derived from the real content
 * pipeline — zero topics in a track renders as "Скоро".
 */
export default function HomePage() {
  const tracks = getAllTracks();
  const totalTopics = tracks.reduce(
    (sum, t) => sum + t.lessons.flatMap((l) => l.topics).length,
    0,
  );

  return (
    <>
      <HeroFold totalTopics={totalTopics} trackCount={tracks.length} />
      <TrackList />
    </>
  );
}

function HeroFold({
  totalTopics,
  trackCount,
}: {
  totalTopics: number;
  trackCount: number;
}) {
  return (
    <section
      className="grid-16 bg-paper"
      style={{ minHeight: "80vh", paddingBlock: "96px" }}
    >
      <div className="col-span-full flex flex-col justify-center gap-8 xl:col-span-12 xl:col-start-3">
        <h1 className="flex items-baseline">
          <Wordmark size="xl" className="block leading-none" />
        </h1>

        <div
          aria-hidden
          className="h-px w-full bg-rule"
          style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
        />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <p className="text-body-l text-ink xl:col-span-8">
            Учебник цифрового дизайна — с примерами, которые работают в браузере.
          </p>

          <div className="flex flex-col gap-2 xl:col-span-4 xl:col-start-10">
            <HeroCaption value={String(totalTopics)} label="тем" />
            <HeroCaption value={String(trackCount)} label="трека" />
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
  const tracks = getAllTracks();
  return (
    <section aria-label="Треки" className="border-t border-rule bg-paper">
      {tracks.map((track) => {
        const stats = getTrackStats(track.slug);
        return (
          <TrackRow
            key={track.slug}
            slug={track.slug}
            shortTitle={track.shortTitle}
            title={track.title}
            description={track.description}
            topicCount={stats.topicCount}
            hours={stats.hours}
            accent={track.colorToken}
          />
        );
      })}
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
  topicCount,
  hours,
  accent,
}: {
  slug: string;
  shortTitle: string;
  title: string;
  description: string;
  topicCount: number;
  hours: number;
  accent: TrackAccent;
}) {
  const hasContent = topicCount > 0;
  return (
    <Link
      href={`/lessons/${slug}`}
      className="group relative block border-t border-rule first:border-t-0 motion-small hover:bg-[oklch(0.94_0.01_85)]"
    >
      <article
        className="grid-16 relative"
        style={{ minHeight: "30vh", paddingBlock: "56px" }}
      >
        <span
          aria-hidden
          className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BG[accent]}`}
          style={{ left: "80px" }}
        />

        <div className="col-span-full flex flex-col gap-4 xl:col-span-5 xl:col-start-3">
          <p className="text-caption text-ink-muted">{shortTitle}</p>
          <h2 className="text-display-m text-ink">
            <span className="relative inline-block">
              {title}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 -bottom-1 h-px w-full scale-x-0 origin-left bg-cinnabar motion-small group-hover:scale-x-100"
                style={{
                  transform: "scaleY(0.5) scaleX(0)",
                  transformOrigin: "left bottom",
                }}
              />
            </span>
          </h2>
          <p className="text-body text-ink-muted" style={{ maxWidth: "44ch" }}>
            {description}
          </p>
        </div>

        <div className="col-span-full xl:col-span-6 xl:col-start-9 xl:self-end">
          <p className="text-caption text-ink-muted">
            {hasContent ? (
              <>
                <span className="text-ink tabular-nums">{topicCount}</span> тем ·{" "}
                <span className="text-ink tabular-nums">{hours}</span> часов
              </>
            ) : (
              <span className="text-ink-muted">Скоро</span>
            )}
          </p>
        </div>
      </article>
    </Link>
  );
}
