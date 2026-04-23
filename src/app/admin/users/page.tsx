import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Пользователи — Админ-панель" };

const PAGE_SIZE = 50;

/**
 * Users list — paginated server-side at 50 rows per page.
 *
 * Search is deferred to a later phase; the editorial register stays dense
 * without chrome. Sort order is newest-first by createdAt.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page ?? 1) || 1);

  const [total, users] = await Promise.all([
    db.user.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredTrack: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    preferredTrack: u.preferredTrack ?? null,
    currentStreak: u.currentStreak,
    longestStreak: u.longestStreak,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Пользователи</h1>
          <p className="mt-2 text-body-s text-ink-muted">
            Всего: {total}. Показано {rows.length} на странице.
          </p>
        </div>
      </header>

      <UsersTable rows={rows} currentAdminId={session.user.id} />

      {totalPages > 1 ? (
        <nav aria-label="Пагинация" className="flex items-center justify-between border-t border-rule pt-4 text-body-s">
          <span className="text-ink-muted">
            Стр. {page} из {totalPages}
          </span>
          <div className="flex items-center gap-3">
            {page > 1 ? (
              <Link
                href={`/admin/users?page=${page - 1}`}
                className="motion-micro text-ink hover:text-cinnabar"
              >
                ← Назад
              </Link>
            ) : (
              <span className="text-ink-muted opacity-50">← Назад</span>
            )}
            {page < totalPages ? (
              <Link
                href={`/admin/users?page=${page + 1}`}
                className="motion-micro text-ink hover:text-cinnabar"
              >
                Вперёд →
              </Link>
            ) : (
              <span className="text-ink-muted opacity-50">Вперёд →</span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
