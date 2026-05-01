import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Челленджи",
  description:
    "Месячные дизайн-задачи Forma et Functio — текущая, прошлые и работы участников.",
  openGraph: {
    title: "Челленджи — Forma et Functio",
    description:
      "Месячные дизайн-задачи и работы участников.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Челленджи — Forma et Functio",
    description: "Месячные дизайн-задачи и работы участников.",
  },
};

export default async function ChallengesIndexPage() {
  const now = new Date();

  // Active = published AND endsAt in the future.
  const [active, archived] = await Promise.all([
    db.challenge.findMany({
      where: { status: "PUBLISHED", endsAt: { gt: now } },
      orderBy: { endsAt: "asc" },
    }),
    db.challenge.findMany({
      where: {
        OR: [{ status: "ARCHIVED" }, { endsAt: { lte: now } }],
        status: { not: "DRAFT" },
      },
      orderBy: { endsAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="bg-paper">
      <Hero hasActive={active.length > 0} />
      <ActiveBand items={active} />
      <ArchivedBand items={archived} />
    </div>
  );
}

function Hero({ hasActive }: { hasActive: boolean }) {
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
        <p className="text-caption text-ink-muted">Челленджи</p>
        <h1 className="text-display-m text-ink">
          {hasActive ? "Открытый месячный челлендж" : "Челленджей сейчас нет"}
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
          Раз в месяц мы публикуем одну задачу и собираем работы. Топ-10 по
          лайкам остаётся видимым после закрытия.
        </p>
      </div>
    </section>
  );
}

function ActiveBand({
  items,
}: {
  items: Array<{
    slug: string;
    title: string;
    brief: string;
    startsAt: Date;
    endsAt: Date;
  }>;
}) {
  if (items.length === 0) return null;
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "32px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Активные"
    >
      <ul
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "0" }}
      >
        {items.map((c) => (
          <li
            key={c.slug}
            className="flex flex-col"
            style={{
              gap: "12px",
              paddingBlock: "32px",
              borderTop: "0.5px solid var(--rule)",
            }}
          >
            <p className="text-caption text-ink-muted tabular-nums">
              {fmt(c.startsAt)} — {fmt(c.endsAt)} · {daysLeft(c.endsAt)}
            </p>
            <h2 className="text-h2 text-ink">
              <Link
                href={`/challenges/${c.slug}`}
                className="motion-micro hover:text-cinnabar"
              >
                {c.title}
              </Link>
            </h2>
            <p
              className="text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                lineHeight: "28px",
                maxWidth: "60ch",
              }}
            >
              {firstLine(c.brief)}
            </p>
            <Link
              href={`/challenges/${c.slug}`}
              className="self-start text-caption text-ink motion-micro hover:text-cinnabar"
              style={{
                border: "0.5px solid var(--rule)",
                padding: "10px 18px",
                letterSpacing: "0.05em",
              }}
            >
              Открыть челлендж →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArchivedBand({
  items,
}: {
  items: Array<{ slug: string; title: string; endsAt: Date }>;
}) {
  if (items.length === 0) return null;
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Прошлые"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">Архив</p>
        <ul className="flex flex-col" style={{ gap: "10px" }}>
          {items.map((c) => (
            <li
              key={c.slug}
              className="flex flex-wrap items-baseline"
              style={{ gap: "16px" }}
            >
              <span className="text-caption text-ink-muted tabular-nums">
                {fmt(c.endsAt)}
              </span>
              <Link
                href={`/challenges/${c.slug}`}
                className="text-ink motion-micro hover:text-cinnabar"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                }}
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function fmt(d: Date): string {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function firstLine(brief: string): string {
  const line = brief.split("\n").find((l) => l.trim().length > 0) ?? "";
  return line.length > 200 ? line.slice(0, 200) + "…" : line;
}

function daysLeft(endsAt: Date): string {
  const ms = endsAt.getTime() - Date.now();
  if (ms < 0) return "Завершён";
  const days = Math.ceil(ms / (24 * 60 * 60_000));
  if (days === 1) return "Остался 1 день";
  if (days < 5) return `Осталось ${days} дня`;
  return `Осталось ${days} дней`;
}
