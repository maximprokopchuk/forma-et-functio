import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { setChallengeStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Челленджи — Админ-панель" };

export default async function AdminChallengesPage() {
  await requireAdmin();
  const rows = await db.challenge.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <article className="px-6 py-8 md:px-10 md:py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-caption text-ink-muted">Челленджи</p>
          <h1 className="text-h2 text-ink">Месячные задачи</h1>
        </div>
        <Link
          href="/admin/challenges/new"
          className="text-caption text-ink motion-micro hover:text-cinnabar"
          style={{
            border: "0.5px solid var(--rule)",
            padding: "10px 18px",
            letterSpacing: "0.05em",
          }}
        >
          Новый →
        </Link>
      </header>

      {rows.length === 0 ? (
        <p
          className="text-ink-muted"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "17px",
          }}
        >
          Пока ни одного челленджа.
        </p>
      ) : (
        <ul className="flex flex-col" style={{ gap: "0" }}>
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-baseline"
              style={{
                gap: "16px",
                paddingBlock: "16px",
                borderTop: "0.5px solid var(--rule)",
              }}
            >
              <span className="text-caption text-ink-muted tabular-nums">
                {c.startsAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                —{" "}
                {c.endsAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span
                className="text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                  flex: "1 1 240px",
                }}
              >
                {c.title}{" "}
                <code
                  className="text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                >
                  /{c.slug}
                </code>
              </span>
              <span
                className="text-caption tabular-nums"
                style={{
                  color:
                    c.status === "PUBLISHED"
                      ? "var(--cinnabar)"
                      : c.status === "ARCHIVED"
                        ? "var(--ink-muted, #5C5752)"
                        : "var(--ink)",
                  letterSpacing: "0.05em",
                }}
              >
                {c.status}
              </span>
              <span className="text-caption text-ink-muted tabular-nums">
                Работ · {c._count.submissions}
              </span>
              <StatusActions id={c.id} current={c.status} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function StatusActions({
  id,
  current,
}: {
  id: string;
  current: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const targets: Array<"DRAFT" | "PUBLISHED" | "ARCHIVED"> = [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
  ];
  return (
    <div className="flex items-center" style={{ gap: "10px" }}>
      {targets
        .filter((s) => s !== current)
        .map((s) => (
          <form
            key={s}
            action={async () => {
              "use server";
              await setChallengeStatus(id, s);
            }}
          >
            <button
              type="submit"
              className="text-caption text-ink-muted motion-micro hover:text-cinnabar"
              style={{ letterSpacing: "0.05em" }}
            >
              → {s.toLowerCase()}
            </button>
          </form>
        ))}
    </div>
  );
}
