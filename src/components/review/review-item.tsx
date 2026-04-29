"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * One review row with two self-check buttons. The grade is the user's
 * honest answer to "did I remember it?" — Anki-style. On click, POST to
 * /api/review/:topicSlug and either fade the row out (review done) or
 * leave it visible with a tiny "ещё раз завтра" note (forgot — still due).
 *
 * After both branches we router.refresh so the header badge in the layout
 * picks up the new due-count.
 */

type Props = {
  topicSlug: string;
  topicTitle: string;
  trackTitle: string | null;
  href: string | null;
  strength: number;
};

export function ReviewItem({
  topicSlug,
  topicTitle,
  trackTitle,
  href,
  strength,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<
    "idle" | "saving" | "remembered" | "forgot" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const grade = useCallback(
    async (remembered: boolean) => {
      setState("saving");
      setError(null);
      try {
        const res = await fetch(
          `/api/review/${encodeURIComponent(topicSlug)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remembered }),
          },
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "Не удалось");
        }
        setState(remembered ? "remembered" : "forgot");
        router.refresh();
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Не удалось");
      }
    },
    [router, topicSlug],
  );

  const done = state === "remembered" || state === "forgot";

  return (
    <li
      className="flex flex-col"
      style={{
        gap: "10px",
        paddingBlock: "20px",
        borderTop: "0.5px solid var(--rule)",
        opacity: done ? 0.5 : 1,
        transition: "opacity 240ms cubic-bezier(0.2,0,0.1,1)",
      }}
    >
      <div className="flex flex-wrap items-baseline" style={{ gap: "16px" }}>
        {trackTitle ? (
          <span className="text-caption text-ink-muted">{trackTitle}</span>
        ) : null}
        <h2 className="text-h3 text-ink">
          {href ? (
            <Link href={href} className="motion-micro hover:text-cinnabar">
              {topicTitle}
            </Link>
          ) : (
            topicTitle
          )}
        </h2>
        <span className="text-caption text-ink-muted tabular-nums">
          ↻ {strength}
        </span>
      </div>

      <div
        className="flex flex-wrap items-center"
        style={{ gap: "16px" }}
        aria-label="Самопроверка"
      >
        <button
          type="button"
          disabled={done || state === "saving"}
          onClick={() => grade(true)}
          className="text-caption text-ink motion-micro hover:text-cinnabar disabled:cursor-not-allowed"
          style={{
            border: "0.5px solid var(--rule)",
            padding: "8px 16px",
            letterSpacing: "0.05em",
            color: state === "remembered" ? "var(--cinnabar)" : undefined,
          }}
        >
          {state === "remembered" ? "Помню ✓" : "Помню"}
        </button>
        <button
          type="button"
          disabled={done || state === "saving"}
          onClick={() => grade(false)}
          className="text-caption text-ink-muted motion-micro hover:text-cinnabar disabled:cursor-not-allowed"
          style={{
            border: "0.5px dashed var(--rule)",
            padding: "8px 16px",
            letterSpacing: "0.05em",
          }}
        >
          {state === "forgot" ? "Не помню — завтра ещё раз" : "Не помню"}
        </button>
        {error ? (
          <span className="text-caption text-cinnabar">{error}</span>
        ) : null}
      </div>
    </li>
  );
}
