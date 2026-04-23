import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Обзор — Админ-панель" };

/**
 * Admin dashboard — a quiet overview, not a flashy KPI screen.
 *
 * Four hairline-bordered counters on top (users, submissions, completions,
 * open reports), followed by a compact feed of the last 10 topic
 * completions so the admin can feel the pulse of the site.
 */
export default async function AdminOverviewPage() {
  await requireAdmin();

  const [usersCount, submissionsCount, completedCount, openReportsCount, recentProgress] =
    await Promise.all([
      db.user.count(),
      db.submission.count(),
      db.userProgress.count({ where: { completed: true } }),
      db.errorReport.count({ where: { resolved: false } }),
      db.userProgress.findMany({
        where: { completed: true },
        orderBy: { completedAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

  const stats: Array<{ label: string; value: number }> = [
    { label: "Всего пользователей", value: usersCount },
    { label: "Отправленных работ", value: submissionsCount },
    { label: "Пройденных тем", value: completedCount },
    { label: "Открытых репортов", value: openReportsCount },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-h1 text-ink">Обзор</h1>
        <p className="mt-2 text-body-s text-ink-muted">
          Оперативные цифры. Последнее обновление — при каждой навигации.
        </p>
      </header>

      <section aria-label="Сводные метрики" className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper p-6">
            <div className="text-caption text-ink-muted">{stat.label}</div>
            <div className="mt-3 text-display-m text-ink">{stat.value}</div>
          </div>
        ))}
      </section>

      <section aria-label="Последние прохождения">
        <h2 className="text-caption text-ink-muted">Последние прохождения</h2>
        <div className="mt-4 border-t border-rule">
          {recentProgress.length === 0 ? (
            <p className="py-8 text-body-s text-ink-muted">
              Прохождений пока нет. Они появятся, когда кто-то отметит тему как изученную.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {recentProgress.map((p) => {
                const when = p.completedAt ?? p.createdAt;
                return (
                  <li
                    key={p.id}
                    className="flex items-baseline justify-between gap-4 py-3 text-body-s"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-ink">{p.user.name ?? p.user.email}</span>
                      <span className="text-ink-muted"> прошёл(а) </span>
                      <Link
                        href={`/lessons/${p.track.toLowerCase()}/${p.lessonSlug}/${p.topicSlug}`}
                        className="motion-micro text-ink hover:text-cinnabar"
                      >
                        {p.lessonSlug} / {p.topicSlug}
                      </Link>
                    </span>
                    <time className="shrink-0 text-caption text-ink-muted" dateTime={when.toISOString()}>
                      {new Date(when).toLocaleString("ru", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
