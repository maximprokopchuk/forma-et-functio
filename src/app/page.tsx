import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { getAllTracks } from "@/lib/content";
import { plural } from "@/lib/pluralize";

/**
 * Homepage — editorial fold.
 * Logo + tagline + four caption metrics + CTA to /lessons.
 * The full track catalog lives at /lessons; the homepage is the front matter.
 */
export default function HomePage() {
  const tracks = getAllTracks();
  const totalTopics = tracks.reduce(
    (sum, t) => sum + t.lessons.flatMap((l) => l.topics).length,
    0,
  );

  return <HeroFold totalTopics={totalTopics} trackCount={tracks.length} />;
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
            <HeroCaption
              value={String(totalTopics)}
              label={plural(totalTopics, ["тема", "темы", "тем"])}
            />
            <HeroCaption
              value={String(trackCount)}
              label={plural(trackCount, ["трек", "трека", "треков"])}
            />
            <HeroCaption label="Живые примеры" />
            <HeroCaption label="На русском" />
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/lessons"
            className="text-body text-cinnabar-on-paper motion-small hover:underline underline-offset-4"
          >
            Открыть уроки →
          </Link>
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
          <span className="text-cinnabar-on-paper tabular-nums">{value}</span> {label}
        </>
      ) : (
        label
      )}
    </span>
  );
}
