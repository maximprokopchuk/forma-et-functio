"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, RotateCcw, Archive, Trash2, FileCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { retrySubmission, archiveSubmission, deleteSubmission } from "./actions";

type Row = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  lessonSlug: string;
  topicSlug: string;
  description: string;
  figmaUrl: string | null;
  status: "PENDING" | "FEEDBACK_READY" | "FEEDBACK_FAILED" | "ARCHIVED";
  feedback: string | null;
  retryCount: number;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "PENDING", label: "В работе" },
  { value: "FEEDBACK_READY", label: "Готовые" },
  { value: "FEEDBACK_FAILED", label: "Ошибки" },
  { value: "ARCHIVED", label: "Архив" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "unscored", label: "Без оценки" },
] as const;

type StatusKey = (typeof STATUS_OPTIONS)[number]["value"];
type SortKey = (typeof SORT_OPTIONS)[number]["value"];

type ParsedFeedback = {
  overall_score?: number;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  dimensions?: Array<{ id: string; score: number; note: string }>;
};

function safeParse(raw: string | null): ParsedFeedback | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedFeedback;
  } catch {
    return null;
  }
}

export function SubmissionsTable({ rows }: { rows: Row[] }) {
  const [list, setList] = useState(rows);
  const [status, setStatus] = useState<StatusKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const total = list.length;
  const pendingCount = list.filter((r) => r.status === "PENDING").length;
  const readyCount = list.filter((r) => r.status === "FEEDBACK_READY").length;
  const failedCount = list.filter((r) => r.status === "FEEDBACK_FAILED").length;

  const filtered = useMemo(() => {
    let out = list;
    if (status !== "all") out = out.filter((r) => r.status === status);
    return [...out].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === "unscored") {
        // Non-ready submissions first, then ready by newest.
        const aReady = a.status === "FEEDBACK_READY" ? 1 : 0;
        const bReady = b.status === "FEEDBACK_READY" ? 1 : 0;
        if (aReady !== bReady) return aReady - bReady;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [list, status, sort]);

  async function run(
    id: string,
    fn: (id: string) => Promise<void>,
    okMsg: string,
    onSuccess?: () => void,
  ) {
    setPendingId(id);
    try {
      await fn(id);
      if (onSuccess) onSuccess();
      toast.success(okMsg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setPendingId(null);
    }
  }

  const stats = [
    { label: "Всего работ", value: total, icon: FileCheck },
    { label: "В очереди", value: pendingCount, icon: Clock },
    { label: "Готово", value: readyCount, icon: CheckCircle2 },
    { label: "Ошибки", value: failedCount, icon: AlertCircle },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1 text-ink">Работы учеников</h1>
        <p className="mt-2 text-body-s text-ink-muted">
          Очередь AI-оценки. Архивируй устаревшие, перезапускай упавшие.
        </p>
      </header>

      <section aria-label="Сводка" className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between bg-paper p-6">
            <div>
              <div className="text-caption text-ink-muted">{s.label}</div>
              <div className="mt-2 text-display-m text-ink">{s.value}</div>
            </div>
            <s.icon className="h-5 w-5 text-ink-muted" aria-hidden />
          </div>
        ))}
      </section>

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

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-body-s text-ink-muted">
          Работ в этом фильтре нет.
        </p>
      ) : (
        <div className="relative w-full overflow-x-auto border-t border-rule">
          <table className="w-full border-collapse text-body-s">
            <thead>
              <tr className="border-b border-rule">
                <th className="w-10 py-3 pr-2"></th>
                <th className="w-24 py-3 pr-4 text-left text-caption text-ink-muted">Дата</th>
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Автор</th>
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Тема</th>
                <th className="w-32 py-3 pr-4 text-left text-caption text-ink-muted">Статус</th>
                <th className="w-24 py-3 pr-4 text-left text-caption text-ink-muted">Оценка</th>
                <th className="w-44 py-3 pl-4 text-right text-caption text-ink-muted">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const parsed = safeParse(row.feedback);
                const isExpanded = expanded === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr className="border-b border-rule align-top">
                      <td className="py-3 pr-2">
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : row.id)}
                          className="motion-micro inline-flex h-6 w-6 items-center justify-center text-ink-muted hover:text-cinnabar"
                          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-caption text-ink-muted whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString("ru")}
                      </td>
                      <td className="py-3 pr-4 text-ink">
                        <div className="truncate">{row.userName ?? row.userEmail}</div>
                        {row.userName ? (
                          <div className="truncate text-caption text-ink-muted">{row.userEmail}</div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-ink-muted">
                        {row.lessonSlug} / {row.topicSlug}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-3 pr-4 text-ink">
                        {row.status === "FEEDBACK_READY" && parsed?.overall_score !== undefined
                          ? `${parsed.overall_score.toFixed(1)} / 5`
                          : "—"}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {row.status === "FEEDBACK_FAILED" ? (
                            <button
                              type="button"
                              disabled={pendingId === row.id}
                              onClick={() =>
                                run(row.id, retrySubmission, "Отправлено на повторную оценку.", () =>
                                  setList((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, status: "PENDING" } : r,
                                    ),
                                  ),
                                )
                              }
                              className="motion-micro inline-flex items-center gap-1 border border-rule bg-paper px-2 py-1 text-caption text-ink hover:border-cinnabar hover:text-cinnabar disabled:opacity-40"
                              title="Повторить оценку"
                            >
                              <RotateCcw className="h-3 w-3" /> Retry
                            </button>
                          ) : null}
                          {row.status !== "ARCHIVED" ? (
                            <button
                              type="button"
                              disabled={pendingId === row.id}
                              onClick={() =>
                                run(row.id, archiveSubmission, "В архив.", () =>
                                  setList((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, status: "ARCHIVED" } : r,
                                    ),
                                  ),
                                )
                              }
                              className="motion-micro inline-flex items-center gap-1 border border-rule bg-paper px-2 py-1 text-caption text-ink hover:border-cinnabar hover:text-cinnabar disabled:opacity-40"
                              title="В архив"
                            >
                              <Archive className="h-3 w-3" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={pendingId === row.id}
                            onClick={() => {
                              if (!confirm("Удалить работу без следа?")) return;
                              run(row.id, deleteSubmission, "Работа удалена.", () =>
                                setList((prev) => prev.filter((r) => r.id !== row.id)),
                              );
                            }}
                            className="motion-micro inline-flex items-center gap-1 border border-rule bg-paper p-1.5 text-ink-muted hover:border-cinnabar hover:text-cinnabar disabled:opacity-40"
                            aria-label="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-b border-rule bg-paper-hover/40">
                        <td colSpan={7} className="px-4 py-5">
                          <ExpandedDetail row={row} parsed={parsed} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  const map = {
    PENDING: { cls: "bg-paper-hover text-ink-muted", label: "В очереди" },
    FEEDBACK_READY: { cls: "bg-lapis/10 text-lapis", label: "Готово" },
    FEEDBACK_FAILED: { cls: "bg-cinnabar/10 text-cinnabar", label: "Ошибка" },
    ARCHIVED: { cls: "bg-rule/40 text-ink-muted", label: "Архив" },
  } as const;
  const entry = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${entry.cls}`}
    >
      {entry.label}
    </span>
  );
}

function ExpandedDetail({ row, parsed }: { row: Row; parsed: ParsedFeedback | null }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h4 className="text-caption text-ink-muted">Описание работы</h4>
        <p className="mt-2 text-body-s whitespace-pre-wrap text-ink">{row.description}</p>
        {row.figmaUrl ? (
          <a
            href={row.figmaUrl}
            target="_blank"
            rel="noreferrer"
            className="motion-micro mt-3 inline-flex items-center gap-1 text-body-s text-ink hover:text-cinnabar"
          >
            <ExternalLink className="h-3 w-3" />
            Figma
          </a>
        ) : null}
        <dl className="mt-4 space-y-1 text-caption text-ink-muted">
          <div>
            <dt className="inline">retryCount:</dt>{" "}
            <dd className="inline text-ink">{row.retryCount}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h4 className="text-caption text-ink-muted">AI-фидбек</h4>
        {!parsed ? (
          <p className="mt-2 text-body-s text-ink-muted">
            Фидбек ещё не готов или не распарсился.
          </p>
        ) : (
          <div className="mt-2 space-y-4">
            {parsed.summary ? (
              <p className="text-body-s text-ink">{parsed.summary}</p>
            ) : null}
            {parsed.dimensions && parsed.dimensions.length > 0 ? (
              <ul className="space-y-1 text-body-s">
                {parsed.dimensions.map((d) => (
                  <li key={d.id} className="text-ink-muted">
                    <span className="text-ink">{d.id}</span>{" "}
                    <span className="text-ink">{d.score}/5</span>
                    {d.note ? <span> — {d.note}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {parsed.strengths && parsed.strengths.length > 0 ? (
              <div>
                <div className="text-caption text-ink-muted">Сильные стороны</div>
                <ul className="mt-1 list-disc pl-5 text-body-s text-ink">
                  {parsed.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {parsed.improvements && parsed.improvements.length > 0 ? (
              <div>
                <div className="text-caption text-ink-muted">Что улучшить</div>
                <ul className="mt-1 list-disc pl-5 text-body-s text-ink">
                  {parsed.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
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
