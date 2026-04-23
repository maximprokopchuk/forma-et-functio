"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Submission form — plan §4.2.
 * Editorial column: textarea + optional Figma URL + disabled screenshot
 * placeholder + isPublic toggle. On submit, POST /api/submissions and poll
 * GET /api/submissions/:id until feedback lands.
 */

type Status =
  | "idle"
  | "submitting"
  | "pending"
  | "ready"
  | "failed"
  | "error";

type FeedbackJson = {
  overall_score: number;
  dimensions: Array<{ id: string; score: number; note: string }>;
  summary: string;
  strengths: string[];
  improvements: string[];
};

type SubmissionApi = {
  id: string;
  status: "PENDING" | "FEEDBACK_READY" | "FEEDBACK_FAILED" | "ARCHIVED";
  feedback: string | null;
};

type SubmissionFormProps = {
  lessonSlug: string;
  topicSlug: string;
  rubricId?: string;
  authed: boolean;
};

export function SubmissionForm({
  lessonSlug,
  topicSlug,
  authed,
}: SubmissionFormProps) {
  const [description, setDescription] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // --- Polling effect, started once we have an id + pending status.
  useEffect(() => {
    if (!submissionId || status !== "pending") return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) return;
        const data = (await res.json()) as SubmissionApi;
        if (cancelled) return;
        if (data.status === "FEEDBACK_READY" && data.feedback) {
          try {
            setFeedback(JSON.parse(data.feedback) as FeedbackJson);
            setStatus("ready");
            stopPolling();
          } catch {
            setError("Не удалось распарсить фидбек");
            setStatus("error");
            stopPolling();
          }
        } else if (data.status === "FEEDBACK_FAILED") {
          setStatus("failed");
          stopPolling();
        }
      } catch {
        // keep polling — transient failure.
      }
    };

    // initial kick then every 5s
    void poll();
    pollRef.current = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [submissionId, status, stopPolling]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim() || status === "submitting") return;

      setError(null);
      setStatus("submitting");

      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonSlug,
            topicSlug,
            description: description.trim(),
            figmaUrl: figmaUrl.trim() || undefined,
            isPublic,
          }),
        });
        if (res.status === 401) {
          setError("Войдите, чтобы отправить работу на проверку.");
          setStatus("error");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(
            (data as { error?: string })?.error ?? "Не удалось отправить",
          );
          setStatus("error");
          return;
        }
        const data = (await res.json()) as { id: string };
        setSubmissionId(data.id);
        setStatus("pending");
      } catch {
        setError("Сеть недоступна. Попробуйте ещё раз.");
        setStatus("error");
      }
    },
    [description, figmaUrl, isPublic, lessonSlug, topicSlug, status],
  );

  if (!authed) {
    return (
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <p className="text-caption text-ink-muted">Работа на проверку</p>
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            lineHeight: "28px",
          }}
        >
          Чтобы отправить работу на AI-фидбек,{" "}
          <a
            href="/login"
            className="text-lapis underline decoration-lapis/50 underline-offset-2"
          >
            войдите
          </a>{" "}
          или{" "}
          <a
            href="/register"
            className="text-lapis underline decoration-lapis/50 underline-offset-2"
          >
            зарегистрируйтесь
          </a>
          .
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col" style={{ gap: "12px" }}>
        <p className="text-caption text-ink-muted">Работа на проверку</p>
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "17px",
            lineHeight: "28px",
          }}
        >
          Оценка генерируется…
        </p>
        <SpinnerRule />
      </div>
    );
  }

  if (status === "ready" && feedback) {
    return <FeedbackReadout feedback={feedback} />;
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <p className="text-caption text-cinnabar">
          Не удалось сгенерировать оценку. Попробуйте отправить ещё раз.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setSubmissionId(null);
            setFeedback(null);
          }}
          className="self-start text-caption text-ink motion-micro hover:text-cinnabar"
        >
          Попробовать снова →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col"
      style={{ gap: "16px" }}
      aria-label="Отправка работы на AI-проверку"
    >
      <p className="text-caption text-ink-muted">Работа на проверку</p>

      <label
        className="flex flex-col"
        style={{ gap: "6px" }}
        htmlFor="submission-description"
      >
        <span className="text-caption text-ink">Описание работы</span>
        <textarea
          id="submission-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите решение и аргументируйте ключевые выборы."
          rows={5}
          maxLength={1000}
          required
          className="bg-paper text-ink resize-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            lineHeight: "26px",
            border: "0.5px solid var(--rule)",
            padding: "12px 14px",
            outline: "none",
          }}
          disabled={status === "submitting"}
        />
        <span className="text-caption text-ink-muted tabular-nums">
          {description.length} / 1000
        </span>
      </label>

      <label
        className="flex flex-col"
        style={{ gap: "6px" }}
        htmlFor="submission-figma"
      >
        <span className="text-caption text-ink">Ссылка на Figma (необязательно)</span>
        <input
          id="submission-figma"
          type="url"
          value={figmaUrl}
          onChange={(e) => setFigmaUrl(e.target.value)}
          placeholder="https://figma.com/file/…"
          maxLength={500}
          className="bg-paper text-ink"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "14px",
            lineHeight: "22px",
            border: "0.5px solid var(--rule)",
            padding: "10px 12px",
            outline: "none",
          }}
          disabled={status === "submitting"}
        />
      </label>

      <div className="flex flex-col" style={{ gap: "6px" }}>
        <span className="text-caption text-ink">Скриншот</span>
        <button
          type="button"
          disabled
          title="Скоро"
          className="self-start text-caption text-ink-muted cursor-not-allowed"
          style={{
            border: "0.5px dashed var(--rule)",
            padding: "10px 14px",
          }}
        >
          Загрузить скриншот · скоро
        </button>
      </div>

      <label className="flex items-start" style={{ gap: "10px" }}>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          disabled={status === "submitting"}
        />
        <span
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            lineHeight: "22px",
          }}
        >
          Показать работу в публичной галерее. Другие студенты смогут увидеть
          описание, фидбек и ссылку на Figma.
        </span>
      </label>

      {error ? (
        <p className="text-caption text-cinnabar">{error}</p>
      ) : null}

      <div className="flex items-center" style={{ gap: "16px" }}>
        <button
          type="submit"
          disabled={!description.trim() || status === "submitting"}
          className="text-caption text-ink motion-micro hover:text-cinnabar disabled:text-ink-muted disabled:cursor-not-allowed"
          style={{
            border: "0.5px solid var(--rule)",
            padding: "10px 18px",
            letterSpacing: "0.05em",
          }}
        >
          {status === "submitting" ? "Отправка…" : "Отправить на проверку →"}
        </button>
      </div>
    </form>
  );
}

function SpinnerRule() {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        height: "2px",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--rule)",
          transform: "scaleY(0.5)",
          transformOrigin: "bottom",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "24%",
          background: "var(--cinnabar)",
          animation: "formaSweep 1.4s linear infinite",
        }}
      />
      <style>{`
        @keyframes formaSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(420%); }
        }
      `}</style>
    </div>
  );
}

function FeedbackReadout({ feedback }: { feedback: FeedbackJson }) {
  return (
    <section
      aria-label="Фидбек"
      className="flex flex-col"
      style={{ gap: "20px" }}
    >
      <div className="flex items-baseline" style={{ gap: "12px" }}>
        <p className="text-caption text-ink-muted">Общая оценка</p>
        <p
          className="text-display-m text-cinnabar tabular-nums"
          style={{ lineHeight: 1 }}
        >
          {feedback.overall_score}
        </p>
        <p className="text-caption text-ink-muted tabular-nums">/ 5</p>
      </div>

      <p
        className="text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "19px",
          lineHeight: "30px",
        }}
      >
        {feedback.summary}
      </p>

      <div
        className="flex flex-col"
        style={{
          gap: "12px",
          paddingTop: "16px",
          borderTop: "0.5px solid var(--rule)",
        }}
      >
        <p className="text-caption text-ink-muted">По измерениям</p>
        <ul className="flex flex-col" style={{ gap: "10px" }}>
          {feedback.dimensions.map((d) => (
            <li
              key={d.id}
              className="flex"
              style={{ gap: "16px", alignItems: "baseline" }}
            >
              <span
                className="text-ink tabular-nums"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "16px",
                  minWidth: "32px",
                }}
              >
                {d.score}/5
              </span>
              <span
                className="text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                <strong style={{ fontWeight: 600 }}>{d.id}.</strong>{" "}
                <span className="text-ink-muted">{d.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {feedback.strengths.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <p className="text-caption text-ink-muted">Сильные места</p>
          <ul
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              lineHeight: "26px",
              paddingLeft: "20px",
              listStyle: "disc",
            }}
          >
            {feedback.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {feedback.improvements.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <p className="text-caption text-ink-muted">Доработать</p>
          <ul
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              lineHeight: "26px",
              paddingLeft: "20px",
              listStyle: "disc",
            }}
          >
            {feedback.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
