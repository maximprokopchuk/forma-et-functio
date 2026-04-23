import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllTracks,
  getTrack,
  type LessonWithTopics,
} from "@/lib/content";
import { plural } from "@/lib/pluralize";

/**
 * Track page — plan §20.2.
 * H1 display-l, manifesto body-l, tiny axonometric structure SVG, then a
 * numbered list (no cards) of lessons. Data is loaded from the MDX content
 * pipeline via `getTrack`.
 */
export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const trackData = getTrack(track);
  if (!trackData) notFound();

  const lessons = trackData.lessons;
  const placeholdersNeeded = Math.max(0, 3 - lessons.length);

  return (
    <article className="bg-paper" style={{ paddingBlock: "96px" }}>
      <header className="grid-16" style={{ paddingBottom: "64px" }}>
        <div className="col-span-full flex flex-col gap-8 xl:col-span-10 xl:col-start-3">
          <p className="text-caption text-ink-muted">
            {trackData.shortTitle}
          </p>
          <h1 className="text-display-l text-ink">{trackData.title}</h1>
          <div
            aria-hidden
            className="h-px w-full bg-rule"
            style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
          />
          <p className="text-body-l text-ink reading-measure">
            {trackData.manifesto}
          </p>
        </div>

        <div className="col-span-full hidden self-start xl:col-span-3 xl:col-start-13 xl:block">
          <StructDiagram count={Math.max(lessons.length, 3)} />
          <p className="mt-2 text-caption text-ink-muted">Структура трека</p>
        </div>
      </header>

      <ul className="border-t border-rule">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <LessonRow trackSlug={trackData.slug} lesson={lesson} />
          </li>
        ))}
        {Array.from({ length: placeholdersNeeded }).map((_, i) => (
          <li key={`placeholder-${i}`}>
            <PlaceholderRow order={lessons.length + i + 1} />
          </li>
        ))}
      </ul>

      {lessons.length < 3 && (
        <p
          className="grid-16"
          style={{ paddingBlock: "48px" }}
        >
          <span className="col-span-full text-caption text-ink-muted xl:col-span-10 xl:col-start-3">
            Скоро новые разделы.
          </span>
        </p>
      )}
    </article>
  );
}

function LessonRow({
  trackSlug,
  lesson,
}: {
  trackSlug: string;
  lesson: LessonWithTopics;
}) {
  const firstTopic = lesson.topics[0];
  const href = firstTopic
    ? `/lessons/${trackSlug}/${lesson.slug}/${firstTopic.slug}`
    : `/lessons/${trackSlug}`;
  const minutes = lesson.topics.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <Link
      href={href}
      className="group block border-b border-rule motion-small hover:bg-paper-hover"
    >
      <div className="grid-16" style={{ paddingBlock: "32px" }}>
        <div className="col-span-full xl:col-span-1 xl:col-start-3">
          <p
            className="text-mono text-ink-muted tabular-nums"
            style={{ fontSize: "22px", lineHeight: "32px" }}
          >
            {lesson.order.toString().padStart(2, "0")}
          </p>
        </div>

        <div className="col-span-full flex flex-col gap-1 xl:col-span-6 xl:col-start-4">
          <h2 className="text-h3 text-ink">{lesson.title}</h2>
          <p className="text-body-s text-ink-muted">{lesson.description}</p>
        </div>

        <div className="col-span-full xl:col-span-2 xl:col-start-10 xl:self-center">
          <p className="text-caption text-ink-muted">
            <span className="tabular-nums">{minutes}</span>{" "}
            {plural(minutes, ["минута", "минуты", "минут"])} ·{" "}
            {lesson.level}
          </p>
        </div>

        <div className="col-span-full xl:col-span-3 xl:col-start-13 xl:self-center">
          <p className="text-caption text-ink-muted">
            <span className="tabular-nums">{lesson.topics.length}</span>{" "}
            {plural(lesson.topics.length, ["тема", "темы", "тем"])}
          </p>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderRow({ order }: { order: number }) {
  return (
    <div
      aria-label="Раздел скоро появится"
      className="block border-b border-rule opacity-40"
    >
      <div className="grid-16" style={{ paddingBlock: "32px" }}>
        <div className="col-span-full xl:col-span-1 xl:col-start-3">
          <p
            className="text-mono text-ink-muted tabular-nums"
            style={{ fontSize: "22px", lineHeight: "32px" }}
          >
            {order.toString().padStart(2, "0")}
          </p>
        </div>
        <div className="col-span-full flex flex-col gap-1 xl:col-span-6 xl:col-start-4">
          <h2 className="text-h3 text-ink-muted">Скоро</h2>
          <p className="text-body-s text-ink-muted">
            Раздел в работе.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Tiny axonometric structure diagram — stacked rectangles at 30°/30°.
 */
function StructDiagram({ count }: { count: number }) {
  const steps = Array.from({ length: count });
  const dx = 8;
  const dy = 10;
  const blockW = 60;
  const blockH = 18;
  const totalH = (count - 1) * dy + blockH + 4;
  const totalW = (count - 1) * dx + blockW + 4;
  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Структура трека"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      className="text-ink"
    >
      {steps.map((_, i) => {
        const order = count - 1 - i;
        const x = order * dx + 1;
        const y = (count - 1 - order) * dy + 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={blockW}
              height={blockH}
              strokeWidth={1.5}
            />
            <line
              x1={x}
              y1={y}
              x2={x + dx}
              y2={y - dy + blockH}
              strokeWidth={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

export async function generateStaticParams() {
  return getAllTracks().map((t) => ({ track: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const trackData = getTrack(track);
  if (!trackData) {
    return { title: "Трек не найден" };
  }
  const title = `${trackData.title} — Forma et Functio`;
  const description = trackData.manifesto;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "ru_RU",
      siteName: "Forma et Functio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
