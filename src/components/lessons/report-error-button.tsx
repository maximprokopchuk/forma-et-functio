"use client";

import { useState } from "react";

/**
 * Report-error affordance — plan §19.
 * Ported from diabolus-in-musica with editorial styling (hairlines, no card,
 * no shadow). Sits quietly at the bottom of a topic's reading band.
 */

type Props = {
  lessonSlug: string;
  topicSlug?: string;
  pageUrl?: string;
};

export function ReportErrorButton({
  lessonSlug,
  topicSlug,
  pageUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          topicSlug,
          description: trimmed,
          pageUrl,
        }),
      });
      if (!res.ok) {
        setError("Не удалось отправить. Попробуйте ещё раз.");
        return;
      }
      setSent(true);
      setDescription("");
    } catch {
      setError("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="text-caption text-ink-muted">
        Спасибо — мы разберёмся.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-caption text-ink-muted motion-micro hover:text-ink"
      >
        Нашли ошибку в тексте?
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col"
      style={{ gap: "10px" }}
    >
      <label className="flex flex-col" style={{ gap: "6px" }}>
        <span className="text-caption text-ink-muted">
          Опишите ошибку — неточность, опечатку, битую ссылку.
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className="bg-paper text-ink resize-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            lineHeight: "22px",
            border: "0.5px solid var(--rule)",
            padding: "10px 12px",
            outline: "none",
          }}
          autoFocus
        />
      </label>
      {error ? (
        <p className="text-caption text-cinnabar">{error}</p>
      ) : null}
      <div className="flex items-center" style={{ gap: "12px" }}>
        <button
          type="submit"
          disabled={!description.trim() || loading}
          className="text-caption text-ink motion-micro hover:text-cinnabar disabled:text-ink-muted disabled:cursor-not-allowed"
          style={{
            border: "0.5px solid var(--rule)",
            padding: "8px 14px",
          }}
        >
          {loading ? "Отправка…" : "Отправить"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setDescription("");
          }}
          className="text-caption text-ink-muted motion-micro hover:text-ink"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
