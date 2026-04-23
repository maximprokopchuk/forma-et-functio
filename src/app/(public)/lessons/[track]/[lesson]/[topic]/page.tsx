import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { LogoMark } from "@/components/layout/wordmark";
import { mdxComponents } from "@/components/mdx/mdx-components";
import {
  getAllTracks,
  getLesson,
  getTopic,
  type LessonWithTopics,
  type TopicMeta,
  type TrackWithLessons,
} from "@/lib/content";

/**
 * Topic page — plan §20.3.
 * Three bands: hero / reading+margin notes / synthesis.
 * Content is loaded from MDX via `getTopic` and rendered with next-mdx-remote
 * using our custom component map. remark-directive is skipped for v1 —
 * authors write JSX directly, which is simpler and keeps the pipeline light.
 */
export default async function TopicPage({
  params,
}: {
  params: Promise<{ track: string; lesson: string; topic: string }>;
}) {
  const { track, lesson, topic } = await params;
  const trackData = getAllTracks().find((t) => t.slug === track);
  if (!trackData) notFound();
  const lessonData = getLesson(track, lesson);
  if (!lessonData) notFound();
  const topicData = getTopic(track, lesson, topic);
  if (!topicData) notFound();

  const components = mdxComponents();
  const nextTopic = findNextTopic(lessonData, topicData);

  return (
    <article className="bg-paper">
      <BandHero track={trackData} lesson={lessonData} topic={topicData} />
      <BandReading content={topicData.content} components={components} />
      <BandSynthesis
        topic={topicData}
        trackSlug={track}
        lessonSlug={lesson}
        nextTopic={nextTopic}
      />
    </article>
  );
}

export async function generateStaticParams() {
  const params: { track: string; lesson: string; topic: string }[] = [];
  for (const track of getAllTracks()) {
    for (const lesson of track.lessons) {
      for (const topic of lesson.topics) {
        params.push({
          track: track.slug,
          lesson: lesson.slug,
          topic: topic.slug,
        });
      }
    }
  }
  return params;
}

function findNextTopic(
  lesson: LessonWithTopics,
  current: TopicMeta,
): TopicMeta | null {
  const idx = lesson.topics.findIndex((t) => t.slug === current.slug);
  if (idx === -1) return null;
  return lesson.topics[idx + 1] ?? null;
}

function BandHero({
  track,
  lesson,
  topic,
}: {
  track: TrackWithLessons;
  lesson: LessonWithTopics;
  topic: TopicMeta;
}) {
  return (
    <section
      className="relative w-full bg-paper"
      style={{ minHeight: "60vh" }}
      aria-label="Обложка темы"
    >
      <HeroComposition />

      <div
        className="absolute bottom-8 left-0 right-0"
        style={{ paddingInline: "80px" }}
      >
        <p className="text-caption text-ink-muted">
          Трек {track.shortTitle} · Раздел{" "}
          <span className="tabular-nums">
            {String(lesson.order).padStart(2, "0")}
          </span>{" "}
          · Тема{" "}
          <span className="tabular-nums">
            {String(topic.order).padStart(2, "0")}
          </span>{" "}
          · <span className="tabular-nums">{topic.estimatedMinutes}</span> мин
        </p>
      </div>

      <div className="absolute right-0 top-0" style={{ padding: "24px 80px" }}>
        <Link
          href="/"
          aria-label="На главную"
          className="text-ink motion-micro hover:text-cinnabar"
        >
          <LogoMark size={28} />
        </Link>
      </div>
    </section>
  );
}

/**
 * Placeholder Munari-style composition. Each topic will eventually get a
 * bespoke hero image (historical reproduction, diagram or specimen).
 * Keep it abstract and paper-bg so the eye rests before entering the body.
 */
function HeroComposition() {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <rect x="0" y="0" width="800" height="600" fill="var(--paper)" />
      <rect x="220" y="160" width="280" height="280" fill="var(--cinnabar)" />
      <rect
        x="360"
        y="220"
        width="160"
        height="160"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />
      <rect
        x="420"
        y="260"
        width="60"
        height="60"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function BandReading({
  content,
  components,
}: {
  content: string;
  components: ReturnType<typeof mdxComponents>;
}) {
  return (
    <section
      className="grid-16 bg-paper"
      style={{ paddingBlock: "96px" }}
      aria-label="Основной текст"
    >
      {/* Main reading column — cols 3-10 on desktop. */}
      <div className="col-span-full xl:col-span-8 xl:col-start-3">
        <div className="mdx-prose">
          <MDXRemote
            source={content}
            components={components}
            /* Content is authored in-repo, not user-supplied.
               Disable the blockJS guard so attribute expressions like
               `options={[{ text, correct }]}` survive compilation. */
            options={{ blockJS: false }}
          />
        </div>
      </div>
    </section>
  );
}

function BandSynthesis({
  topic,
  trackSlug,
  lessonSlug,
  nextTopic,
}: {
  topic: TopicMeta;
  trackSlug: string;
  lessonSlug: string;
  nextTopic: TopicMeta | null;
}) {
  return (
    <section
      aria-label="Итог"
      className="grid-16 w-full bg-cinnabar text-paper"
      style={{ paddingBlock: "96px" }}
    >
      <div className="col-span-full flex flex-col gap-8 xl:col-span-10 xl:col-start-3">
        <p className="text-caption">Итог</p>
        <h2 className="text-display-m">{topic.title}</h2>
        <p className="text-body-l" style={{ maxWidth: "48ch" }}>
          {topic.description}
        </p>

        {nextTopic ? (
          <p>
            <Link
              href={`/lessons/${trackSlug}/${lessonSlug}/${nextTopic.slug}`}
              className="text-h3 text-paper motion-small hover:underline underline-offset-4"
            >
              Следующая тема: {nextTopic.title} →
            </Link>
          </p>
        ) : (
          <p>
            <Link
              href={`/lessons/${trackSlug}`}
              className="text-h3 text-paper motion-small hover:underline underline-offset-4"
            >
              Вернуться к разделу →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
