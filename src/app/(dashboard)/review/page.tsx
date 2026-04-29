import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllTracks } from "@/lib/content";
import { plural } from "@/lib/pluralize";
import type { TrackSlug } from "@/lib/tracks";
import { ReviewItem } from "@/components/review/review-item";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Повторение",
  description:
    "Темы, которые пора повторить — интервальное повторение по принципу spaced repetition.",
  robots: { index: false, follow: false },
};

type ReviewRow = {
  id: string;
  trackSlug: TrackSlug | null;
  trackTitle: string | null;
  lessonSlug: string;
  topicSlug: string;
  topicTitle: string;
  dueAt: string;
  strength: number;
};

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/review");
  }

  const userId = session.user.id;
  const now = new Date();
  const [dueRows, upcomingRows] = await Promise.all([
    db.reviewQueue.findMany({
      where: { userId, dueAt: { lte: now } },
      orderBy: { dueAt: "asc" },
      take: 50,
    }),
    db.reviewQueue.findMany({
      where: { userId, dueAt: { gt: now } },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
  ]);

  const tracks = getAllTracks();
  const enrich = (row: typeof dueRows[number]): ReviewRow => {
    for (const t of tracks) {
      for (const l of t.lessons) {
        if (l.slug !== row.lessonSlug) continue;
        const topic = l.topics.find((tp) => tp.slug === row.topicSlug);
        if (!topic) continue;
        return {
          id: row.id,
          trackSlug: t.slug,
          trackTitle: t.title,
          lessonSlug: row.lessonSlug,
          topicSlug: row.topicSlug,
          topicTitle: topic.title,
          dueAt: row.dueAt.toISOString(),
          strength: row.strength,
        };
      }
    }
    return {
      id: row.id,
      trackSlug: null,
      trackTitle: null,
      lessonSlug: row.lessonSlug,
      topicSlug: row.topicSlug,
      topicTitle: row.topicSlug,
      dueAt: row.dueAt.toISOString(),
      strength: row.strength,
    };
  };

  const due = dueRows.map(enrich);
  const upcoming = upcomingRows.map(enrich);

  return (
    <article className="bg-paper">
      <Hero count={due.length} />
      <DueBand items={due} />
      <UpcomingBand items={upcoming} />
    </article>
  );
}

function Hero({ count }: { count: number }) {
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
        <p className="text-caption text-ink-muted">Повторение</p>
        <h1 className="text-display-m text-ink">
          {count > 0 ? (
            <>
              К повторению{" "}
              <span className="text-cinnabar tabular-nums">{count}</span>{" "}
              {plural(count, ["тема", "темы", "тем"])}
            </>
          ) : (
            "Повторять нечего"
          )}
        </h1>
        <p
          className="text-ink-muted"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "19px",
            lineHeight: "30px",
            maxWidth: "60ch",
          }}
        >
          {count > 0
            ? "Откройте тему, перечитайте ключевые секции, потом честно отметьте «помню» или «не помню». Помню — следующее повторение через несколько дней или недель; не помню — снова завтра."
            : "Все темы повторены — на сегодня. Новые темы добавятся в очередь, когда вы отметите их пройденными в уроках, и появятся здесь через сутки."}
        </p>
      </div>
    </section>
  );
}

function DueBand({ items }: { items: ReviewRow[] }) {
  if (items.length === 0) {
    return (
      <section
        className="grid-16"
        style={{
          paddingBlock: "32px",
          borderTop: "0.5px solid var(--rule)",
        }}
      >
        <div className="col-span-full xl:col-span-10 xl:col-start-3">
          <Link
            href="/lessons"
            className="self-start text-caption text-ink motion-micro hover:text-cinnabar"
            style={{
              border: "0.5px solid var(--rule)",
              padding: "10px 18px",
              letterSpacing: "0.05em",
              display: "inline-block",
            }}
          >
            Открыть уроки →
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "32px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="К повторению"
    >
      <ul
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "0" }}
      >
        {items.map((item) => (
          <ReviewItem
            key={item.id}
            topicSlug={item.topicSlug}
            topicTitle={item.topicTitle}
            trackTitle={item.trackTitle}
            href={
              item.trackSlug
                ? `/lessons/${item.trackSlug}/${item.lessonSlug}/${item.topicSlug}`
                : null
            }
            strength={item.strength}
          />
        ))}
      </ul>
    </section>
  );
}

function UpcomingBand({ items }: { items: ReviewRow[] }) {
  if (items.length === 0) return null;
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Скоро на повторении"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">Скоро в очереди</p>
        <ul className="flex flex-col" style={{ gap: "10px" }}>
          {items.map((item) => {
            const due = new Date(item.dueAt);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline"
                style={{ gap: "16px" }}
              >
                <span className="text-caption text-ink-muted tabular-nums">
                  {due.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span
                  className="text-ink"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "17px",
                  }}
                >
                  {item.topicTitle}
                </span>
                {item.trackTitle ? (
                  <span className="text-caption text-ink-muted">
                    {item.trackTitle}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
