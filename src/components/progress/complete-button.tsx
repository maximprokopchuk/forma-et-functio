"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * "Пройдено" toggle — plan §5 / §14.
 * On click: POST /api/progress; on success with streak change, briefly flash
 * a cinnabar dot and animate the F·F mark (simulated here with a single
 * cinnabar rule that ligates from 0 to full width).
 */

type Props = {
  lessonSlug: string;
  topicSlug: string;
  authed: boolean;
};

type ApiResponse = {
  progress: { completed: boolean; completedAt: string | null } | null;
  streak: { current: number; longest: number; lastDay: string | null };
  streakChanged?: boolean;
};

export function CompleteButton({ lessonSlug, topicSlug, authed }: Props) {
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Load current state on mount
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/progress?lessonSlug=${encodeURIComponent(lessonSlug)}&topicSlug=${encodeURIComponent(topicSlug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as ApiResponse;
        if (cancelled) return;
        setCompleted(data.progress?.completed ?? false);
        setStreak(data.streak.current);
      } catch {
        // offline is fine, user clicks to retry.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed, lessonSlug, topicSlug]);

  const toggle = useCallback(async () => {
    if (!authed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          topicSlug,
          completed: !completed,
        }),
      });
      if (!res.ok) {
        setError("Не удалось сохранить прогресс");
        return;
      }
      const data = (await res.json()) as ApiResponse;
      setCompleted(data.progress?.completed ?? false);
      setStreak(data.streak.current);
      if (data.streakChanged) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 800);
      }
    } catch {
      setError("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }, [authed, completed, lessonSlug, topicSlug, loading]);

  if (!authed) {
    return (
      <p className="text-caption text-ink-muted">
        <a
          href="/login"
          className="text-lapis underline decoration-lapis/50 underline-offset-2"
        >
          Войдите
        </a>
        , чтобы отмечать пройденные темы и вести серию.
      </p>
    );
  }

  return (
    <div className="flex items-center" style={{ gap: "16px" }}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={completed}
        className="text-caption text-ink motion-micro hover:text-cinnabar disabled:text-ink-muted disabled:cursor-not-allowed"
        style={{
          border: completed
            ? "0.5px solid var(--cinnabar)"
            : "0.5px solid var(--rule)",
          padding: "10px 18px",
          letterSpacing: "0.05em",
          color: completed ? "var(--cinnabar)" : undefined,
        }}
      >
        {completed ? "Пройдено ✓" : loading ? "…" : "Отметить пройденным"}
      </button>

      {streak !== null && streak > 0 ? (
        <p className="text-caption text-ink-muted tabular-nums">
          Серия · <span className="text-ink">{streak}</span>{" "}
          {streak === 1 ? "день" : "дн."}
        </p>
      ) : null}

      {/* Cinnabar ligate-flash — fires once per streak-change event. */}
      <div
        aria-hidden
        style={{
          height: "2px",
          width: flash ? "64px" : "0",
          background: "var(--cinnabar)",
          transition: "width 320ms var(--ease-paper, ease)",
        }}
      />

      {error ? (
        <p className="text-caption text-cinnabar">{error}</p>
      ) : null}
    </div>
  );
}
