"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ClipboardList, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toggleResolved, deleteReport } from "./actions";

type Report = {
  id: string;
  lessonSlug: string;
  topicSlug: string | null;
  description: string;
  pageUrl: string | null;
  resolved: boolean;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "open", label: "Открытые" },
  { value: "resolved", label: "Закрытые" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "open", label: "Сначала открытые" },
  { value: "resolved", label: "Сначала закрытые" },
] as const;

type StatusKey = (typeof STATUS_OPTIONS)[number]["value"];
type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/**
 * Client-state filtering + sorting (per Phase 3 pattern) — no URL round-trips.
 * Mutations optimistically update local state; the server action re-validates
 * the `/admin/error-reports` path so a hard refresh stays authoritative.
 */
export function ErrorReportsTable({ reports: initial }: { reports: Report[] }) {
  const [reports, setReports] = useState(initial);
  const [status, setStatus] = useState<StatusKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const total = reports.length;
  const openCount = reports.filter((r) => !r.resolved).length;
  const resolvedCount = total - openCount;

  const filtered = useMemo(() => {
    let list = reports;
    if (status === "open") list = list.filter((r) => !r.resolved);
    if (status === "resolved") list = list.filter((r) => r.resolved);

    return [...list].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === "open") return Number(a.resolved) - Number(b.resolved);
      if (sort === "resolved") return Number(b.resolved) - Number(a.resolved);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reports, status, sort]);

  async function handleToggle(id: string, resolved: boolean) {
    try {
      await toggleResolved(id, resolved);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r)));
    } catch {
      toast.error("Не удалось обновить статус репорта.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Не удалось удалить репорт.");
    }
  }

  const stats = [
    { label: "Всего репортов", value: total, icon: ClipboardList },
    { label: "Открытых", value: openCount, icon: AlertCircle },
    { label: "Закрытых", value: resolvedCount, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1 text-ink">Репорты об ошибках</h1>
        <p className="mt-2 text-body-s text-ink-muted">
          Баг-трекер от пользователей. Закрытое = исправлено или не требует действий.
        </p>
      </header>

      {/* Stats */}
      <section aria-label="Сводка" className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between bg-paper p-6">
            <div>
              <div className="text-caption text-ink-muted">{stat.label}</div>
              <div className="mt-2 text-display-m text-ink">{stat.value}</div>
            </div>
            <stat.icon className="h-5 w-5 text-ink-muted" aria-hidden />
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterGroup
          label="Статус"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v as StatusKey)}
        />
        <FilterGroup
          label="Сортировка"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <CheckCircle2 className="h-10 w-10 text-ink-muted opacity-40" aria-hidden />
          <p className="text-body text-ink">Репортов нет</p>
          <p className="text-body-s text-ink-muted">
            {status !== "all"
              ? "Попробуйте изменить фильтр."
              : "Когда пользователи сообщат об ошибках, они появятся здесь."}
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto border-t border-rule">
          <table className="w-full border-collapse text-body-s">
            <thead>
              <tr className="border-b border-rule">
                <th className="w-28 py-3 pr-4 text-left text-caption text-ink-muted">Дата</th>
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Урок / Тема</th>
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Описание</th>
                <th className="w-24 py-3 pr-4 text-left text-caption text-ink-muted">Статус</th>
                <th className="w-40 py-3 pl-4 text-right text-caption text-ink-muted">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => {
                const lessonUrl = report.topicSlug
                  ? `/lessons/${report.lessonSlug}/${report.topicSlug}`
                  : `/lessons/${report.lessonSlug}`;
                const description =
                  report.description.length > 120
                    ? report.description.slice(0, 120) + "…"
                    : report.description;

                return (
                  <tr key={report.id} className="border-b border-rule align-top">
                    <td className="py-3 pr-4 text-caption text-ink-muted whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString("ru")}
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        href={lessonUrl}
                        target="_blank"
                        className="motion-micro inline-flex items-center gap-1 text-ink hover:text-cinnabar"
                      >
                        <span>{report.lessonSlug}</span>
                        {report.topicSlug ? (
                          <span className="text-ink-muted">/ {report.topicSlug}</span>
                        ) : null}
                        <ExternalLink className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden />
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-muted">{description}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          report.resolved
                            ? "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-paper-hover text-ink-muted"
                            : "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-cinnabar/10 text-cinnabar"
                        }
                      >
                        {report.resolved ? "Закрыт" : "Открыт"}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(report.id, report.resolved)}
                          className="motion-micro inline-flex items-center border border-rule bg-paper px-2 py-1 text-caption text-ink hover:border-cinnabar hover:text-cinnabar"
                        >
                          {report.resolved ? "Открыть" : "Закрыть"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id)}
                          className="motion-micro inline-flex items-center border border-rule bg-paper p-1.5 text-ink-muted hover:border-cinnabar hover:text-cinnabar"
                          aria-label="Удалить репорт"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-ink-muted">{label}:</span>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "motion-micro border border-cinnabar bg-cinnabar px-2 py-1 text-caption text-paper-on-accent"
                : "motion-micro border border-rule bg-paper px-2 py-1 text-caption text-ink hover:border-cinnabar hover:text-cinnabar"
            }
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
