import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { plural } from "@/lib/pluralize";
import { streakStatus } from "@/lib/streak";
import { TRACKS, type TrackSlug } from "@/lib/tracks";
import { DigestToggle } from "@/components/profile/digest-toggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Профиль",
  description: "Серия, отправленные работы и настройки рассылки.",
  robots: { index: false, follow: false },
};

type SubmissionRow = {
  id: string;
  topicSlug: string;
  lessonSlug: string;
  status: string;
  isPublic: boolean;
  likesCount: number;
  createdAt: Date;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const userId = session.user.id;
  const [user, submissions, completedCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakDay: true,
        preferredTrack: true,
        emailDigests: true,
        createdAt: true,
      },
    }),
    db.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        topicSlug: true,
        lessonSlug: true,
        status: true,
        isPublic: true,
        likesCount: true,
        createdAt: true,
      },
    }),
    db.userProgress.count({
      where: { userId, completed: true },
    }),
  ]);
  if (!user) redirect("/login");

  return (
    <article className="bg-paper">
      <Hero
        name={user.name ?? "—"}
        email={user.email}
        memberSince={user.createdAt}
        preferredTrack={user.preferredTrack as TrackSlug | null}
      />
      <Stats
        currentStreak={user.currentStreak}
        longestStreak={user.longestStreak}
        lastStreakDay={user.lastStreakDay}
        completedCount={completedCount}
      />
      <Submissions rows={submissions} />
      <Settings emailDigests={user.emailDigests} />
    </article>
  );
}

function Hero({
  name,
  email,
  memberSince,
  preferredTrack,
}: {
  name: string;
  email: string;
  memberSince: Date;
  preferredTrack: TrackSlug | null;
}) {
  return (
    <section
      className="grid-16"
      style={{ paddingBlock: "96px" }}
      aria-label="Заголовок профиля"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">Профиль</p>
        <h1 className="text-display-m text-ink">{name}</h1>
        <p
          className="text-ink-muted"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            lineHeight: "28px",
          }}
        >
          {email}
          {preferredTrack ? (
            <>
              {" · "}
              <Link
                href={`/lessons/${preferredTrack}`}
                className="text-lapis underline decoration-lapis/50 underline-offset-2 motion-micro hover:decoration-lapis"
              >
                Трек: {TRACKS[preferredTrack].title}
              </Link>
            </>
          ) : null}
          {" · "}
          С{" "}
          {memberSince.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </section>
  );
}

function Stats({
  currentStreak,
  longestStreak,
  lastStreakDay,
  completedCount,
}: {
  currentStreak: number;
  longestStreak: number;
  lastStreakDay: Date | null;
  completedCount: number;
}) {
  const status = streakStatus(lastStreakDay);
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Статистика"
    >
      <div
        className="col-span-full grid xl:col-span-10 xl:col-start-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "32px",
        }}
      >
        <Stat
          label="Текущая серия"
          value={currentStreak}
          unit={plural(currentStreak, ["день", "дня", "дней"])}
          accent={status === "today" ? "cinnabar" : status === "atRisk" ? "rule" : null}
          hint={
            status === "today"
              ? "Сегодня уже отмечено"
              : status === "atRisk"
                ? "Может сгореть до полуночи UTC"
                : "Серия неактивна"
          }
        />
        <Stat
          label="Рекорд"
          value={longestStreak}
          unit={plural(longestStreak, ["день", "дня", "дней"])}
        />
        <Stat
          label="Пройдено тем"
          value={completedCount}
          unit={plural(completedCount, ["тема", "темы", "тем"])}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
  hint,
}: {
  label: string;
  value: number;
  unit?: string;
  accent?: "cinnabar" | "rule" | null;
  hint?: string;
}) {
  const valueColor =
    accent === "cinnabar"
      ? "var(--cinnabar)"
      : accent === "rule"
        ? "var(--ink-muted, #5C5752)"
        : "var(--ink)";
  return (
    <div className="flex flex-col" style={{ gap: "6px" }}>
      <p className="text-caption text-ink-muted">{label}</p>
      <p
        className="tabular-nums"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "48px",
          lineHeight: 1,
          color: valueColor,
        }}
      >
        {value}
        {unit ? (
          <span
            className="text-ink-muted"
            style={{ fontSize: "17px", marginLeft: "8px" }}
          >
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? (
        <p className="text-caption text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function Submissions({ rows }: { rows: SubmissionRow[] }) {
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Отправленные работы"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "20px" }}
      >
        <p className="text-caption text-ink-muted">
          Последние работы · {rows.length}
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
            Отправленных работ пока нет.{" "}
            <Link
              href="/lessons"
              className="text-lapis underline decoration-lapis/50 underline-offset-2"
            >
              Открыть уроки →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col" style={{ gap: "12px" }}>
            {rows.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-baseline"
                style={{
                  gap: "16px",
                  paddingBlock: "12px",
                  borderTop: "0.5px solid var(--rule)",
                }}
              >
                <span className="text-caption text-ink-muted tabular-nums">
                  {s.createdAt.toLocaleDateString("ru-RU", {
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
                  {s.lessonSlug} · {s.topicSlug}
                </span>
                <StatusBadge status={s.status} />
                {s.isPublic ? (
                  <Link
                    href={`/gallery/${s.id}`}
                    className="text-caption text-lapis underline decoration-lapis/50 underline-offset-2"
                  >
                    В галерее ({s.likesCount}{" "}
                    {plural(s.likesCount, ["лайк", "лайка", "лайков"])}) →
                  </Link>
                ) : (
                  <span className="text-caption text-ink-muted">Приватно</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Ждёт оценки", color: "var(--ochre)" },
    FEEDBACK_READY: { label: "Оценено", color: "var(--ink)" },
    FEEDBACK_FAILED: { label: "Ошибка", color: "var(--cinnabar)" },
    ARCHIVED: { label: "В архиве", color: "var(--ink-muted, #5C5752)" },
  };
  const meta = map[status] ?? { label: status, color: "var(--ink)" };
  return (
    <span
      className="text-caption tabular-nums"
      style={{
        color: meta.color,
        letterSpacing: "0.05em",
      }}
    >
      {meta.label}
    </span>
  );
}

function Settings({ emailDigests }: { emailDigests: boolean }) {
  return (
    <section
      className="grid-16"
      style={{
        paddingBlock: "48px",
        borderTop: "0.5px solid var(--rule)",
      }}
      aria-label="Настройки"
    >
      <div
        className="col-span-full flex flex-col xl:col-span-10 xl:col-start-3"
        style={{ gap: "16px" }}
      >
        <p className="text-caption text-ink-muted">Настройки</p>
        <DigestToggle initial={emailDigests} />
      </div>
    </section>
  );
}

