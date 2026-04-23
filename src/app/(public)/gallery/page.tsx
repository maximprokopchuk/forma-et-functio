import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAllTracks } from "@/lib/content";
import { TRACK_SLUGS, TRACKS, type TrackSlug } from "@/lib/tracks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Галерея работ",
  description:
    "Публичные работы студентов, отправленные на AI-проверку. Опционально — участники сами решают показать свою работу.",
};

/**
 * Public submissions gallery — plan §6.
 * List of opt-in public submissions with AI feedback summary.
 * CSS-columns masonry (no library). Filters by track, client-side via
 * query params (no re-fetching of auth state).
 */
export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const trackFilter: TrackSlug | null =
    track && TRACK_SLUGS.includes(track as TrackSlug)
      ? (track as TrackSlug)
      : null;

  // --- Resolve each submission to its track by walking the content tree.
  //     Content is in-memory so this is cheap.
  const topicToTrack = buildTopicToTrack();

  const whereTrack =
    trackFilter === null
      ? {}
      : {
          lessonSlug: {
            in: lessonsForTrack(trackFilter),
          },
        };

  const rows = await db.submission.findMany({
    where: {
      isPublic: true,
      status: "FEEDBACK_READY",
      ...whereTrack,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  const items = rows.map((row) => {
    const trackSlug = topicToTrack.get(`${row.lessonSlug}/${row.topicSlug}`);
    let summary: string | null = null;
    let overall: number | null = null;
    if (row.feedback) {
      try {
        const parsed = JSON.parse(row.feedback) as {
          overall_score?: number;
          summary?: string;
        };
        if (typeof parsed.summary === "string") summary = parsed.summary;
        if (typeof parsed.overall_score === "number")
          overall = parsed.overall_score;
      } catch {
        // bad JSON — skip feedback body
      }
    }
    return {
      id: row.id,
      trackSlug: trackSlug ?? null,
      lessonSlug: row.lessonSlug,
      topicSlug: row.topicSlug,
      figmaUrl: row.figmaUrl,
      description: row.description,
      summary,
      overall,
      userName: row.user?.name ?? "Без имени",
      createdAt: row.createdAt,
    };
  });

  return (
    <div className="bg-paper">
      <section
        className="grid-16"
        style={{ paddingBlock: "96px" }}
        aria-label="Галерея"
      >
        <div className="col-span-full xl:col-span-10 xl:col-start-3 flex flex-col" style={{ gap: "16px" }}>
          <p className="text-caption text-ink-muted">Галерея</p>
          <h1 className="text-display-m text-ink">Работы студентов</h1>
          <p
            className="text-ink-muted"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "19px",
              lineHeight: "30px",
              maxWidth: "52ch",
            }}
          >
            Публичные работы, прошедшие AI-проверку. Каждая — opt-in: студент
            сам решает, показать ли разбор.
          </p>
        </div>
      </section>

      <section
        aria-label="Фильтры"
        className="grid-16"
        style={{
          paddingBlock: "24px",
          borderBlock: "0.5px solid var(--rule)",
        }}
      >
        <nav
          className="col-span-full xl:col-span-10 xl:col-start-3 flex items-center flex-wrap"
          style={{ gap: "20px" }}
          aria-label="Фильтр по треку"
        >
          <FilterLink href="/gallery" label="Все треки" active={trackFilter === null} />
          {TRACK_SLUGS.map((slug) => (
            <FilterLink
              key={slug}
              href={`/gallery?track=${slug}`}
              label={TRACKS[slug].title}
              active={trackFilter === slug}
            />
          ))}
        </nav>
      </section>

      <section
        className="grid-16"
        style={{ paddingBlock: "64px" }}
        aria-label="Список работ"
      >
        <div className="col-span-full xl:col-span-12 xl:col-start-3">
          {items.length === 0 ? (
            <p
              className="text-ink-muted"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "19px",
                lineHeight: "30px",
              }}
            >
              Пока нет публичных работ по этому фильтру.
            </p>
          ) : (
            <ul
              style={{
                columnCount: 2,
                columnGap: "48px",
              }}
              className="lg:[column-count:2]"
            >
              {items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    breakInside: "avoid",
                    marginBottom: "48px",
                  }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-caption text-ink-muted">
                    {item.trackSlug ? TRACKS[item.trackSlug].title : "—"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <h2 className="text-h3 text-ink">{item.userName}</h2>
                  <p
                    className="text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "17px",
                      lineHeight: "28px",
                    }}
                  >
                    {item.description}
                  </p>
                  {item.summary ? (
                    <p
                      className="text-ink-muted"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: "15px",
                        lineHeight: "24px",
                        paddingLeft: "16px",
                        borderLeft: "2px solid var(--cinnabar)",
                      }}
                    >
                      {item.summary}
                    </p>
                  ) : null}
                  <div className="flex items-center" style={{ gap: "16px" }}>
                    {item.overall !== null ? (
                      <p className="text-caption text-ink-muted tabular-nums">
                        Оценка · <span className="text-ink">{item.overall}</span>/5
                      </p>
                    ) : null}
                    {item.figmaUrl ? (
                      <a
                        href={item.figmaUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-caption text-lapis underline decoration-lapis/50 underline-offset-2"
                      >
                        Открыть Figma →
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="text-caption motion-micro"
      style={{
        color: active ? "var(--cinnabar)" : "var(--ink)",
        letterSpacing: "0.05em",
        borderBottom: active ? "0.5px solid var(--cinnabar)" : "0.5px solid transparent",
        paddingBottom: "2px",
      }}
    >
      {label}
    </Link>
  );
}

function buildTopicToTrack(): Map<string, TrackSlug> {
  const map = new Map<string, TrackSlug>();
  for (const t of getAllTracks()) {
    for (const l of t.lessons) {
      for (const topic of l.topics) {
        map.set(`${l.slug}/${topic.slug}`, t.slug);
      }
    }
  }
  return map;
}

function lessonsForTrack(track: TrackSlug): string[] {
  const lessons: string[] = [];
  for (const t of getAllTracks()) {
    if (t.slug !== track) continue;
    for (const l of t.lessons) lessons.push(l.slug);
  }
  return lessons;
}
