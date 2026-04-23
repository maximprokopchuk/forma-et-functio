"use client";

import Link from "next/link";

/**
 * Admin error boundary.
 *
 * If `requireAdmin()` throws (non-admin user, or DB hiccup), this renders
 * instead of the route. Middleware already redirects non-admins away from
 * /admin at the edge, so in practice this boundary is mostly a safety net
 * for DB / runtime errors.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="px-6 py-16 max-w-xl mx-auto space-y-6">
      <h1 className="text-h1 text-ink">Что-то пошло не так</h1>
      <p className="text-body-s text-ink-muted">
        {error.message === "Forbidden"
          ? "У вас нет прав для этой страницы."
          : error.message === "Unauthorized"
            ? "Требуется вход."
            : "Ошибка в админ-разделе. Попробуйте перезагрузить страницу."}
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="motion-micro border border-rule bg-paper px-3 py-1.5 text-caption text-ink hover:border-cinnabar hover:text-cinnabar"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="motion-micro text-caption text-ink-muted hover:text-cinnabar"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
