import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAllTracks, getLesson, getTopic } from "@/lib/content";
import { getRubric } from "@/lib/rubrics";
import { TRACKS, type TrackSlug } from "@/lib/tracks";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

type FeedbackJson = {
  overall_score?: number;
  dimensions?: Array<{ id: string; score: number; note: string }>;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
};

async function loadEntry(id: string) {
  if (!/^[a-z0-9]+$/i.test(id)) return null;
  const row = await db.submission.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!row) return null;
  if (!row.isPublic || row.status !== "FEEDBACK_READY") return null;

  const trackSlug = resolveTrack(row.lessonSlug, row.topicSlug);
  const topic = trackSlug
    ? getTopic(trackSlug, row.lessonSlug, row.topicSlug)
    : null;
  const lesson = trackSlug ? getLesson(trackSlug, row.lessonSlug) : null;
  const rubric = topic?.rubricId ? getRubric(topic.rubricId) : null;

  let feedback: FeedbackJson | null = null;
  if (row.feedback) {
    try {
      feedback = JSON.parse(row.feedback) as FeedbackJson;
    } catch {
      feedback = null;
    }
  }

  return {
    id: row.id,
    userName: row.user?.name ?? "Без имени",
    description: row.description,
    figmaUrl: row.figmaUrl,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
    trackSlug,
    lessonSlug: row.lessonSlug,
    topicSlug: row.topicSlug,
    topicTitle: topic?.title ?? row.topicSlug,
    lessonTitle: lesson?.title ?? row.lessonSlug,
    rubric,
    feedback,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await loadEntry(id);
  if (!entry) return { title: "Работа не найдена" };
  const title = `${entry.userName} · ${entry.topicTitle}`;
  const description =
    entry.feedback?.summary?.slice(0, 160) ??
    entry.description.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Forma et Functio`,
      description,
      type: "article",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary",
      title: `${title} — Forma et Functio`,
      description,
    },
  };
}

export default async function GalleryEntryPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const entry = await loadEntry(id);
  if (!entry) notFound();

  return (
    <article className="bg-paper">
      <Hero entry={entry} />
      {entry.imageUrl ? <ImageBand entry={entry} /> : null}
      <Body entry={entry} />
    </article>
  );
}

function ImageBand({ entry }: { entry: Entry }) {
  if (!entry.imageUrl) return null;
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Скриншот работы"
    >
      <div className="col-span-full xl:col-span-10 xl:col-start-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.imageUrl}
          alt={`Скриншот работы ${entry.userName} по теме ${entry.topicTitle}`}
          loading="lazy"
          decoding="async"
          className="bg-paper"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            border: "0.5px solid var(--rule)",
          }}
        />
      </div>
    </section>
  );
}

type Entry = NonNullable<Awaited<ReturnType<typeof loadEntry>>>;

function Hero({ entry }: { entry: Entry }) {
  return (
    <section
      className="grid-16"
      style={{ paddingBlock: "96px" }}
      aria-label="Заголовок работы"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">
          <Link
            href="/gallery"
            className="motion-micro hover:text-cinnabar"
          >
            Галерея
          </Link>
          {" · "}
          {entry.trackSlug ? TRACKS[entry.trackSlug].title : "—"}
          {" · "}
          {new Date(entry.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="text-display-m text-ink">{entry.userName}</h1>
        <p
          className="text-ink-muted"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "19px",
            lineHeight: "30px",
          }}
        >
          Работа по теме{" "}
          {entry.trackSlug ? (
            <Link
              href={`/lessons/${entry.trackSlug}/${entry.lessonSlug}/${entry.topicSlug}`}
              className="text-lapis underline decoration-lapis/50 underline-offset-2 motion-micro hover:decoration-lapis"
            >
              {entry.topicTitle}
            </Link>
          ) : (
            entry.topicTitle
          )}
        </p>
      </div>
    </section>
  );
}

function Body({ entry }: { entry: Entry }) {
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "64px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Описание и фидбек"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-7 xl:col-start-3"
        style={{ gap: "32px" }}
      >
        <div className="flex flex-col" style={{ gap: "12px" }}>
          <p className="text-caption text-ink-muted">Описание автора</p>
          <p
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "19px",
              lineHeight: "30px",
              whiteSpace: "pre-wrap",
            }}
          >
            {entry.description}
          </p>
          {entry.figmaUrl ? (
            <a
              href={entry.figmaUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="self-start text-caption text-lapis underline decoration-lapis/50 underline-offset-2"
            >
              Открыть Figma →
            </a>
          ) : null}
        </div>

        {entry.feedback ? <FeedbackBlock entry={entry} /> : null}
      </div>

      {entry.trackSlug ? (
        <aside
          className="col-span-full xl:col-span-3 xl:col-start-12 flex flex-col"
          style={{ gap: "12px", borderLeft: "0.5px solid var(--rule)", paddingLeft: "24px" }}
          aria-label="Контекст"
        >
          <p className="text-caption text-ink-muted">Контекст</p>
          <Link
            href={`/lessons/${entry.trackSlug}/${entry.lessonSlug}/${entry.topicSlug}`}
            className="text-ink motion-micro hover:text-cinnabar"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              lineHeight: "26px",
            }}
          >
            {entry.lessonTitle} · {entry.topicTitle} →
          </Link>
          <p className="text-caption text-ink-muted">
            Откройте тему, чтобы изучить материал и попробовать самим.
          </p>
        </aside>
      ) : null}
    </section>
  );
}

function FeedbackBlock({ entry }: { entry: Entry }) {
  const f = entry.feedback;
  if (!f) return null;
  const labelFor = (id: string) =>
    entry.rubric?.dimensions.find((d) => d.id === id)?.label ?? id;
  const weightFor = (id: string) =>
    entry.rubric?.dimensions.find((d) => d.id === id)?.weight ?? null;
  const sortedDims = entry.rubric && f.dimensions
    ? [...f.dimensions].sort(
        (a, b) => (weightFor(b.id) ?? 0) - (weightFor(a.id) ?? 0),
      )
    : f.dimensions ?? [];

  return (
    <div
      className="flex flex-col"
      style={{
        gap: "20px",
        paddingTop: "24px",
        borderTop: "0.5px solid var(--rule)",
      }}
    >
      {f.overall_score != null ? (
        <div className="flex items-baseline" style={{ gap: "12px" }}>
          <p className="text-caption text-ink-muted">AI-оценка</p>
          <p
            className="text-display-m text-cinnabar tabular-nums"
            style={{ lineHeight: 1 }}
          >
            {f.overall_score}
          </p>
          <p className="text-caption text-ink-muted tabular-nums">/ 5</p>
        </div>
      ) : null}

      {f.summary ? (
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "19px",
            lineHeight: "30px",
            paddingLeft: "16px",
            borderLeft: "2px solid var(--cinnabar)",
          }}
        >
          {f.summary}
        </p>
      ) : null}

      {sortedDims.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "10px" }}>
          <p className="text-caption text-ink-muted">По измерениям</p>
          <ul className="flex flex-col" style={{ gap: "10px" }}>
            {sortedDims.map((d) => {
              const weight = weightFor(d.id);
              return (
                <li
                  key={d.id}
                  className="flex"
                  style={{ gap: "16px", alignItems: "baseline" }}
                >
                  <span
                    className="text-ink tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "16px",
                      minWidth: "32px",
                    }}
                  >
                    {d.score}/5
                  </span>
                  <span
                    className="text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    <strong style={{ fontWeight: 600 }}>{labelFor(d.id)}</strong>
                    {weight != null ? (
                      <span className="text-ink-muted tabular-nums">
                        {" · "}
                        {Math.round(weight * 100)}%
                      </span>
                    ) : null}
                    <span className="text-ink-muted">{" — "}{d.note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {f.strengths && f.strengths.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <p className="text-caption text-ink-muted">Сильные места</p>
          <ul
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              lineHeight: "26px",
              paddingLeft: "20px",
              listStyle: "disc",
            }}
          >
            {f.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {f.improvements && f.improvements.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <p className="text-caption text-ink-muted">Доработать</p>
          <ul
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              lineHeight: "26px",
              paddingLeft: "20px",
              listStyle: "disc",
            }}
          >
            {f.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function resolveTrack(lessonSlug: string, topicSlug: string): TrackSlug | null {
  for (const t of getAllTracks()) {
    for (const l of t.lessons) {
      if (l.slug !== lessonSlug) continue;
      if (l.topics.some((tp) => tp.slug === topicSlug)) return t.slug;
    }
  }
  return null;
}

