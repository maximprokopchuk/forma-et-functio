import Link from "next/link";
import { Settings, Users, FileCheck, AlertCircle, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * Admin shell — editorial register, not SaaS dashboard.
 *
 * Layout:
 *  - Desktop: 224px sidebar with hairline rule on the right
 *  - Mobile: horizontal-scroll strip pinned under the site header
 *
 * Badge counts are fetched fresh on every navigation (the layout is a
 * server component and we disable caching for the whole /admin segment
 * via `force-dynamic` on each page). No shadows, no rounded cards —
 * just paper with hairlines and small-caps labels.
 *
 * Auth is enforced twice: middleware redirects non-admins at the edge,
 * and every admin page/action calls `requireAdmin()` at the top as a
 * belt-and-braces guard (see plan §10 audit findings).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const [unresolvedReports, pendingSubmissions] = await Promise.all([
    db.errorReport.count({ where: { resolved: false } }),
    db.submission.count({ where: { status: "PENDING" } }),
  ]);

  const adminNav = [
    { href: "/admin", label: "Обзор", icon: Settings, badge: null as number | null },
    { href: "/admin/users", label: "Пользователи", icon: Users, badge: null as number | null },
    {
      href: "/admin/submissions",
      label: "Работы",
      icon: FileCheck,
      badge: pendingSubmissions > 0 ? pendingSubmissions : null,
    },
    {
      href: "/admin/error-reports",
      label: "Репорты",
      icon: AlertCircle,
      badge: unresolvedReports > 0 ? unresolvedReports : null,
    },
    { href: "/admin/content", label: "Контент", icon: BookOpen, badge: null as number | null },
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col md:flex-row">
      {/* Mobile nav — horizontal scroll strip */}
      <nav
        aria-label="Админ-навигация"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-rule px-4 py-2 md:hidden"
      >
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="motion-micro relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 py-1 text-caption text-ink hover:text-cinnabar"
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            {item.label}
            {item.badge !== null ? (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center bg-cinnabar px-1 text-[10px] leading-none font-medium text-paper-on-accent">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar — 56 col with hairline rule to the right */}
      <aside className="relative hidden w-56 shrink-0 px-6 py-8 md:block">
        <h2 className="text-caption mb-6 text-ink-muted">Админ-панель</h2>
        <nav aria-label="Админ-навигация" className="space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="motion-micro group flex items-center gap-2 py-1.5 text-body-s text-ink hover:text-cinnabar"
            >
              <item.icon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-cinnabar" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== null ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center bg-cinnabar px-1 text-[10px] leading-none font-medium text-paper-on-accent">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Hairline — right edge of sidebar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-rule"
          style={{ transform: "scaleX(0.5)", transformOrigin: "right" }}
        />
      </aside>

      <div className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
