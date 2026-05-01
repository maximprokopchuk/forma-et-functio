import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/components/chat/markdown";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadChallenge(slug: string) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const c = await db.challenge.findUnique({ where: { slug } });
  if (!c) return null;
  if (c.status === "DRAFT") return null;
  return c;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadChallenge(slug);
  if (!c) return { title: "Челлендж не найден" };
  return {
    title: c.title,
    description: c.brief.slice(0, 160),
    openGraph: {
      title: `${c.title} — Челлендж · Forma et Functio`,
      description: c.brief.slice(0, 160),
      type: "article",
      locale: "ru_RU",
    },
  };
}

type LeaderboardRow = {
  id: string;
  authorName: string;
  description: string;
  imageUrl: string | null;
  likesCount: number;
  isPublic: boolean;
};

export default async function ChallengePage({ params }: { params: Params }) {
  const { slug } = await params;
  const c = await loadChallenge(slug);
  if (!c) notFound();

  const top: LeaderboardRow[] = (
    await db.submission.findMany({
      where: {
        challengeId: c.id,
        isPublic: true,
        status: "FEEDBACK_READY",
      },
      orderBy: [{ likesCount: "desc" }, { createdAt: "asc" }],
      take: 10,
      include: { user: { select: { name: true } } },
    })
  ).map((s) => ({
    id: s.id,
    authorName: s.user?.name ?? "Без имени",
    description: s.description,
    imageUrl: s.imageUrl,
    likesCount: s.likesCount,
    isPublic: s.isPublic,
  }));

  const isActive = c.status === "PUBLISHED" && c.endsAt > new Date();

  return (
    <article className="bg-paper">
      <Hero
        slug={c.slug}
        title={c.title}
        startsAt={c.startsAt}
        endsAt={c.endsAt}
        isActive={isActive}
      />
      <Brief brief={c.brief} />
      <Leaderboard rows={top} isActive={isActive} />
    </article>
  );
}

function Hero({
  slug,
  title,
  startsAt,
  endsAt,
  isActive,
}: {
  slug: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
}) {
  return (
    <section
      className="grid-16"
      style={{ paddingBlock: "96px" }}
      aria-label="Заголовок"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">
          <Link
            href="/challenges"
            className="motion-micro hover:text-cinnabar"
          >
            Челленджи
          </Link>
          {" · "}
          {fmt(startsAt)} — {fmt(endsAt)}
          {" · "}
          {isActive ? "Открыт" : "Завершён"}
        </p>
        <h1 className="text-display-m text-ink">{title}</h1>
        {isActive ? (
          <p className="text-caption text-ink-muted">
            Чтобы участвовать — отправьте работу через любой урок и укажите этот
            челлендж в форме (передастся через ссылку{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                background: "var(--paper-hover)",
                padding: "0 4px",
              }}
            >
              ?challenge={slug}
            </code>
            ).
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Brief({ brief }: { brief: string }) {
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Бриф"
    >
      <div className="col-span-full xl:col-span-7 xl:col-start-3">
        <Markdown source={brief} />
      </div>
    </section>
  );
}

function Leaderboard({
  rows,
  isActive,
}: {
  rows: LeaderboardRow[];
  isActive: boolean;
}) {
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Топ-10"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "20px" }}
      >
        <p className="text-caption text-ink-muted">
          {isActive ? "Лидеры" : "Топ-10 · итоги"}
        </p>
        {rows.length === 0 ? (
          <p
            className="text-ink-muted"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "17px",
              lineHeight: "28px",
            }}
          >
            {isActive ? "Работ пока нет — будьте первым." : "Работ не было."}
          </p>
        ) : (
          <ol
            className="flex flex-col"
            style={{ gap: "16px", listStyle: "none", paddingLeft: 0 }}
          >
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start"
                style={{
                  gap: "16px",
                  paddingBlock: "16px",
                  borderTop: "0.5px solid var(--rule)",
                }}
              >
                <span
                  className="text-mono text-ink-muted tabular-nums"
                  style={{ minWidth: "32px" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 flex flex-col" style={{ gap: "6px", minWidth: "240px" }}>
                  <p
                    className="text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "17px",
                      lineHeight: "26px",
                    }}
                  >
                    <Link
                      href={`/gallery/${r.id}`}
                      className="motion-micro hover:text-cinnabar"
                    >
                      {r.authorName}
                    </Link>
                  </p>
                  <p
                    className="text-ink-muted"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "15px",
                      lineHeight: "24px",
                      maxWidth: "60ch",
                    }}
                  >
                    {r.description.length > 240
                      ? r.description.slice(0, 240) + "…"
                      : r.description}
                  </p>
                </div>
                <p className="text-caption text-ink-muted tabular-nums">
                  ❤ {r.likesCount}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function fmt(d: Date): string {
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
