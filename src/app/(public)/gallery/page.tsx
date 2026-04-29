import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllTracks } from "@/lib/content";
import { LikeButton } from "@/components/submissions/like-button";
import { TRACK_SLUGS, TRACKS, type TrackSlug } from "@/lib/tracks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Галерея работ",
  description:
    "Публичные работы студентов, отправленные на AI-проверку. Опционально — участники сами решают показать свою работу.",
  openGraph: {
    title: "Галерея работ — Forma et Functio",
    description:
      "Публичные работы студентов Forma et Functio с AI-разбором по рубрике.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Галерея работ — Forma et Functio",
    description:
      "Публичные работы студентов Forma et Functio с AI-разбором по рубрике.",
  },
};

const PAGE_SIZE = 24;
const SLUG_RE = /^[a-z0-9-]+$/;
type Sort = "recent" | "popular";

/**
 * Public submissions gallery — plan §6.
 * List of opt-in public submissions with AI feedback summary.
 * CSS-columns masonry (no library). Server-rendered filter / sort / paginate
 * via query params — no client state, deep-linkable.
 */
export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{
    track?: string;
    topic?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const trackFilter: TrackSlug | null =
    sp.track && TRACK_SLUGS.includes(sp.track as TrackSlug)
      ? (sp.track as TrackSlug)
      : null;
  const topicFilter =
    sp.topic && SLUG_RE.test(sp.topic) ? sp.topic : null;
  const sort: Sort = sp.sort === "popular" ? "popular" : "recent";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const authed = Boolean(viewerId);

  // --- Resolve each submission to its track by walking the content tree.
  //     Content is in-memory so this is cheap.
  const topicToTrack = buildTopicToTrack();

  // Topic + track interact: a topic slug isn't unique across the project,
  // so when a track is set we restrict to lessons within it; without a
  // track we just match the topic slug everywhere it appears.
  const whereTrack =
    trackFilter === null
      ? {}
      : {
          lessonSlug: {
            in: lessonsForTrack(trackFilter),
          },
        };
  const whereTopic = topicFilter ? { topicSlug: topicFilter } : {};

  const baseWhere = {
    isPublic: true,
    status: "FEEDBACK_READY" as const,
    ...whereTrack,
    ...whereTopic,
  };

  const [total, rows] = await Promise.all([
    db.submission.count({ where: baseWhere }),
    db.submission.findMany({
      where: baseWhere,
      orderBy:
        sort === "popular"
          ? [{ likesCount: "desc" }, { createdAt: "desc" }]
          : { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: {
          select: { name: true },
        },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const topicTitle = topicFilter ? resolveTopicTitle(topicFilter) : null;

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
      authorId: row.userId,
      trackSlug: trackSlug ?? null,
      lessonSlug: row.lessonSlug,
      topicSlug: row.topicSlug,
      figmaUrl: row.figmaUrl,
      imageUrl: row.imageUrl,
      description: row.description,
      summary,
      overall,
      likesCount: row.likesCount,
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
        <div
          className="col-span-full xl:col-span-10 xl:col-start-3 flex flex-col"
          style={{ gap: "16px" }}
        >
          <nav
            className="flex items-center flex-wrap"
            style={{ gap: "20px" }}
            aria-label="Фильтр по треку"
          >
            <FilterLink
              href={buildQuery(
                { track: trackFilter, topic: topicFilter, sort, page },
                { track: null, page: 1 },
              )}
              label="Все треки"
              active={trackFilter === null}
            />
            {TRACK_SLUGS.map((slug) => (
              <FilterLink
                key={slug}
                href={buildQuery(
                  { track: trackFilter, topic: topicFilter, sort, page },
                  { track: slug, page: 1 },
                )}
                label={TRACKS[slug].title}
                active={trackFilter === slug}
              />
            ))}
          </nav>

          <div
            className="flex items-center flex-wrap"
            style={{ gap: "16px" }}
          >
            {topicFilter ? (
              <span
                className="inline-flex items-center text-caption text-ink"
                style={{
                  gap: "8px",
                  border: "0.5px solid var(--cinnabar)",
                  padding: "4px 10px",
                  letterSpacing: "0.05em",
                }}
              >
                Тема · {topicTitle ?? topicFilter}
                <Link
                  href={buildQuery(
                    { track: trackFilter, topic: topicFilter, sort, page },
                    { topic: null, page: 1 },
                  )}
                  aria-label="Убрать фильтр по теме"
                  className="text-cinnabar motion-micro hover:text-ink"
                >
                  ×
                </Link>
              </span>
            ) : null}

            <span
              className="inline-flex items-center text-caption text-ink-muted"
              style={{ gap: "12px", marginLeft: "auto" }}
              aria-label="Сортировка"
            >
              <SortLink
                href={buildQuery(
                  { track: trackFilter, topic: topicFilter, sort, page },
                  { sort: "recent", page: 1 },
                )}
                label="Свежие"
                active={sort === "recent"}
              />
              <span aria-hidden>·</span>
              <SortLink
                href={buildQuery(
                  { track: trackFilter, topic: topicFilter, sort, page },
                  { sort: "popular", page: 1 },
                )}
                label="Популярные"
                active={sort === "popular"}
              />
            </span>
          </div>
        </div>
      </section>

      <section
        className="grid-16"
        style={{ paddingBlock: "64px" }}
        aria-label="Список работ"
      >
        <div className="col-span-full xl:col-span-12 xl:col-start-3">
          {items.length === 0 ? (
            <div className="flex flex-col" style={{ gap: "12px" }}>
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
              <Link
                href="/lessons"
                className="self-start text-caption text-ink motion-micro hover:text-cinnabar"
                style={{
                  border: "0.5px solid var(--rule)",
                  padding: "10px 18px",
                  letterSpacing: "0.05em",
                }}
              >
                Открыть уроки →
              </Link>
            </div>
          ) : (
            <>
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
                  {item.imageUrl ? (
                    <Link href={`/gallery/${item.id}`} aria-label="Открыть полный разбор">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={`Скриншот работы ${item.userName}`}
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
                    </Link>
                  ) : null}
                  <h2 className="text-h3 text-ink">
                    <Link
                      href={`/gallery/${item.id}`}
                      className="motion-micro hover:text-cinnabar"
                    >
                      {item.userName}
                    </Link>
                  </h2>
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
                  <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
                    <LikeButton
                      submissionId={item.id}
                      initialCount={item.likesCount}
                      authed={authed}
                      ownerView={viewerId === item.authorId}
                    />
                    {item.overall !== null ? (
                      <p className="text-caption text-ink-muted tabular-nums">
                        Оценка · <span className="text-ink">{item.overall}</span>/5
                      </p>
                    ) : null}
                    <Link
                      href={`/gallery/${item.id}`}
                      className="text-caption text-ink motion-micro hover:text-cinnabar"
                    >
                      Полный разбор →
                    </Link>
                    {item.figmaUrl ? (
                      <a
                        href={item.figmaUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-caption text-lapis underline decoration-lapis/50 underline-offset-2"
                      >
                        Figma →
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={totalPages}
              build={(p) =>
                buildQuery(
                  { track: trackFilter, topic: topicFilter, sort, page },
                  { page: p },
                )
              }
            />
            </>
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

function SortLink({
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
        color: active ? "var(--ink)" : "var(--ink-muted, #5C5752)",
        letterSpacing: "0.05em",
      }}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  build,
}: {
  page: number;
  totalPages: number;
  build: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Пагинация"
      className="flex items-center justify-between"
      style={{
        gap: "16px",
        marginTop: "48px",
        paddingTop: "24px",
        borderTop: "0.5px solid var(--rule)",
      }}
    >
      {page > 1 ? (
        <Link
          href={build(page - 1)}
          className="text-caption text-ink motion-micro hover:text-cinnabar"
          style={{ letterSpacing: "0.05em" }}
        >
          ← Предыдущая
        </Link>
      ) : (
        <span aria-hidden style={{ visibility: "hidden" }}>placeholder</span>
      )}
      <span className="text-caption text-ink-muted tabular-nums">
        Страница <span className="text-ink">{page}</span> из {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={build(page + 1)}
          className="text-caption text-ink motion-micro hover:text-cinnabar"
          style={{ letterSpacing: "0.05em" }}
        >
          Следующая →
        </Link>
      ) : (
        <span aria-hidden style={{ visibility: "hidden" }}>placeholder</span>
      )}
    </nav>
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

function resolveTopicTitle(topicSlug: string): string | null {
  for (const t of getAllTracks()) {
    for (const l of t.lessons) {
      const topic = l.topics.find((tp) => tp.slug === topicSlug);
      if (topic) return topic.title;
    }
  }
  return null;
}

/**
 * Build a query string preserving filters but allowing per-call override.
 * Empty values are dropped so URLs stay tidy.
 */
function buildQuery(
  base: { track: TrackSlug | null; topic: string | null; sort: Sort; page: number },
  override: Partial<{
    track: TrackSlug | null;
    topic: string | null;
    sort: Sort;
    page: number;
  }>,
): string {
  const merged = { ...base, ...override };
  const params = new URLSearchParams();
  if (merged.track) params.set("track", merged.track);
  if (merged.topic) params.set("topic", merged.topic);
  if (merged.sort !== "recent") params.set("sort", merged.sort);
  if (merged.page > 1) params.set("page", String(merged.page));
  const qs = params.toString();
  return qs ? `/gallery?${qs}` : "/gallery";
}
