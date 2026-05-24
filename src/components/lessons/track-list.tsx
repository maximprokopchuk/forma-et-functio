import Link from "next/link";
import { getAllTracks, getTrackStats } from "@/lib/content";
import { plural } from "@/lib/pluralize";
import type { TrackAccent } from "@/lib/tracks";

/**
 * CRAFT uses the `ink-strip` token rather than `bg-ink` because in dark mode
 * `ink` is cream — a bright bar on paper-dark reads as alarm, not accent.
 * `ink-strip` collapses to a quiet mid-tone in dark and stays near-black in
 * light.
 */
const ACCENT_BG: Record<TrackAccent, string> = {
  cinnabar: "bg-cinnabar",
  lapis: "bg-lapis",
  ochre: "bg-ochre",
  ink: "bg-ink-strip",
};

export function TrackList() {
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
      className="group relative block border-t border-rule first:border-t-0 motion-small hover:bg-paper-hover"
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
                <span className="text-ink tabular-nums">{topicCount}</span>{" "}
                {plural(topicCount, ["тема", "темы", "тем"])} ·{" "}
                <span className="text-ink tabular-nums">{hours}</span>{" "}
                {plural(hours, ["час", "часа", "часов"])}
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
