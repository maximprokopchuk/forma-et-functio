"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * LikeButton — optimistic toggle for SubmissionLike. Visual: small cinnabar
 * dot when liked, hairline outline when not, count to the right. No heart
 * icon — keeps the editorial register; the dot pulse on click is the only
 * affordance.
 *
 * Optimistic update flow:
 *   1. Snapshot prev (liked, count)
 *   2. Apply expected next state immediately
 *   3. POST in the background; on error, revert and surface a tiny message
 */

type Props = {
  submissionId: string;
  initialCount: number;
  authed: boolean;
  /** Hide the entire control if the viewer authored the submission. */
  ownerView?: boolean;
};

type LikeApi = { liked: boolean; count: number };

export function LikeButton({
  submissionId,
  initialCount,
  authed,
  ownerView = false,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve "did the viewer like this?" on mount. Skip when not authed —
  // the button still renders the count but its action redirects to login.
  useEffect(() => {
    if (!authed || ownerView) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}/like`);
        if (!res.ok) return;
        const data = (await res.json()) as LikeApi;
        if (!cancelled) {
          setLiked(data.liked);
          setCount(data.count);
        }
      } catch {
        // non-fatal — user can still toggle; the count just won't reflect
        // their existing like until the next fetch.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed, ownerView, submissionId]);

  const toggle = useCallback(async () => {
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    if (pending) return;
    setError(null);

    const prev = { liked, count };
    const optimistic = liked
      ? { liked: false, count: Math.max(0, count - 1) }
      : { liked: true, count: count + 1 };
    setLiked(optimistic.liked);
    setCount(optimistic.count);
    setPending(true);

    try {
      const res = await fetch(`/api/submissions/${submissionId}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Не удалось");
      }
      const data = (await res.json()) as LikeApi;
      setLiked(data.liked);
      setCount(data.count);
    } catch (err) {
      setLiked(prev.liked);
      setCount(prev.count);
      setError(err instanceof Error ? err.message : "Не удалось");
    } finally {
      setPending(false);
    }
  }, [authed, liked, count, pending, submissionId]);

  if (ownerView) {
    return (
      <p className="text-caption text-ink-muted tabular-nums">
        Лайков · <span className="text-ink">{count}</span>
      </p>
    );
  }

  return (
    <span className="inline-flex items-center" style={{ gap: "8px" }}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
        className="inline-flex items-center motion-micro disabled:cursor-not-allowed"
        style={{
          gap: "8px",
          padding: "4px 10px",
          border: "0.5px solid var(--rule)",
          color: liked ? "var(--cinnabar)" : "var(--ink)",
          letterSpacing: "0.05em",
        }}
      >
        <span
          aria-hidden
          className={liked ? "bg-cinnabar" : "bg-rule"}
          style={{ width: "8px", height: "8px", borderRadius: "50%" }}
        />
        <span className="text-caption tabular-nums">{count}</span>
      </button>
      {error ? (
        <span className="text-caption text-cinnabar">{error}</span>
      ) : null}
    </span>
  );
}
