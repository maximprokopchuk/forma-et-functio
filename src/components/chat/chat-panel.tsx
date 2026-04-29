"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "./markdown";

const OPEN_KEY = "forma:chat:open";

/**
 * Editorial chat panel — plan §11 / §20.3.
 * Collapsed: small pill bottom-right. Expanded: slide-up column with hanging
 * indents and role captions ("Вы" / "Преподаватель"). No bubbles, no shadows,
 * no rounded chrome — paper + hairlines only.
 */

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ApiMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type ChatPanelProps = {
  lessonSlug: string;
  topicSlug: string;
  authed: boolean;
};

export function ChatPanel({ lessonSlug, topicSlug, authed }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Restore last open/closed state across page loads. Keyed globally
  //     (not per-topic) — chat is a sticky UI element, not topic-bound.
  //     We start with open=false (matches SSR), then bump to true on mount
  //     if the user had it open before; useSyncExternalStore would be the
  //     by-the-book solution but it's overkill for a single boolean toggle.
  useEffect(() => {
    if (!authed || typeof window === "undefined") return;
    if (window.localStorage.getItem(OPEN_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [authed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  }, [open]);

  // --- Reduced motion detection — disables the slide-up transition.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // --- Focus textarea when the panel opens; close on Escape.
  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // --- Load history the first time the panel opens.
  useEffect(() => {
    if (!open || historyLoaded || !authed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat?lessonSlug=${encodeURIComponent(lessonSlug)}&topicSlug=${encodeURIComponent(topicSlug)}`,
          { method: "GET" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { messages: ApiMessage[] };
        if (cancelled) return;
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        );
      } catch {
        // Ignore — offline / network glitch. History reloads next time panel opens.
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, historyLoaded, authed, lessonSlug, topicSlug]);

  // Auto-scroll to bottom on new content.
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, overrideText?: string) => {
      e.preventDefault();
      const trimmed = (overrideText ?? input).trim();
      if (!trimmed || loading) return;

      setError(null);
      setLastFailedInput(null);
      setLoading(true);

      const localUserId = `local-u-${Date.now()}`;
      const localAssistantId = `local-a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: localUserId, role: "user", content: trimmed },
        { id: localAssistantId, role: "assistant", content: "", streaming: true },
      ]);
      setInput("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonSlug, topicSlug, message: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Ошибка сети");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          acc += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === localAssistantId
                ? { ...m, content: acc, streaming: true }
                : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === localAssistantId ? { ...m, streaming: false } : m,
          ),
        );
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        if (!aborted) {
          setError("Не удалось получить ответ.");
          setLastFailedInput(trimmed);
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === localAssistantId ? { ...m, streaming: false } : m,
          ),
        );
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [input, loading, lessonSlug, topicSlug],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleRetry = useCallback(
    (e: React.MouseEvent) => {
      if (!lastFailedInput) return;
      void handleSubmit(e as unknown as React.FormEvent, lastFailedInput);
    },
    [handleSubmit, lastFailedInput],
  );

  if (!authed) {
    // Unauthenticated: show a quiet inline hint, no floating pill.
    return null;
  }

  return (
    <>
      {/* Collapsed trigger — bottom-right pill on paper, hairline outline. */}
      {!open ? (
        <button
          type="button"
          aria-label="Спросить преподавателя"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-paper text-ink text-caption motion-micro hover:text-cinnabar"
          style={{
            padding: "10px 16px",
            border: "0.5px solid var(--rule)",
            letterSpacing: "0.05em",
          }}
        >
          Спросить →
        </button>
      ) : null}

      {/* Expanded panel — slide up from bottom-right, editorial column. */}
      {open ? (
        <aside
          role="dialog"
          aria-label="Диалог с преподавателем"
          className="fixed z-40 bg-paper flex flex-col"
          style={{
            bottom: "24px",
            right: "24px",
            width: "min(440px, calc(100vw - 48px))",
            height: "min(640px, calc(100vh - 48px))",
            border: "0.5px solid var(--rule)",
            transition: reducedMotion
              ? "none"
              : "transform var(--dur-small, 240ms) var(--ease-paper, ease)",
          }}
        >
          <header
            className="flex items-center justify-between"
            style={{
              padding: "16px 20px",
              borderBottom: "0.5px solid var(--rule)",
            }}
          >
            <p className="text-caption text-ink-muted">Преподаватель</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Свернуть"
              className="text-caption text-ink-muted motion-micro hover:text-ink"
            >
              Закрыть
            </button>
          </header>

          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: "20px 20px 8px" }}
          >
            {messages.length === 0 ? (
              <p
                className="text-ink-muted"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "15px",
                  lineHeight: "24px",
                }}
              >
                Спросите что-нибудь по теме — от уточнения определения до
                разбора вашего решения.
              </p>
            ) : null}

            <ul className="flex flex-col" style={{ gap: "20px" }}>
              {messages.map((m) => (
                <li key={m.id} className="flex flex-col" style={{ gap: "4px" }}>
                  <p className="text-caption text-ink-muted">
                    {m.role === "user" ? "Вы" : "Преподаватель"}
                  </p>
                  {m.role === "assistant" ? (
                    m.content ? (
                      <div className="flex flex-col">
                        <Markdown source={m.content} />
                      </div>
                    ) : (
                      <p
                        className="text-ink-muted"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "15px",
                          lineHeight: "24px",
                        }}
                      >
                        {m.streaming ? "…" : ""}
                      </p>
                    )
                  ) : (
                    <p
                      className="text-ink"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "15px",
                        lineHeight: "24px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div ref={bottomRef} />
          </div>

          {error ? (
            <div
              className="flex items-center"
              style={{ padding: "0 20px 8px", gap: "12px" }}
            >
              <p className="text-caption text-cinnabar">{error}</p>
              {lastFailedInput ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-caption text-ink motion-micro hover:text-cinnabar"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Повторить →
                </button>
              ) : null}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col"
            style={{
              gap: "8px",
              padding: "16px 20px",
              borderTop: "0.5px solid var(--rule)",
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Ваш вопрос
            </label>
            <textarea
              id="chat-input"
              name="message"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              rows={2}
              placeholder="Ваш вопрос"
              className="bg-paper text-ink resize-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "15px",
                lineHeight: "22px",
                border: "0.5px solid var(--rule)",
                padding: "10px 12px",
                outline: "none",
              }}
              maxLength={2000}
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <p className="text-caption text-ink-muted">
                Enter — отправить · Shift+Enter — перенос строки
              </p>
              <div className="flex items-center" style={{ gap: "12px" }}>
                {loading ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="text-caption text-ink-muted motion-micro hover:text-ink"
                  >
                    Остановить
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="text-caption text-ink motion-micro hover:text-cinnabar disabled:text-ink-muted disabled:cursor-not-allowed"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Отправить →
                </button>
              </div>
            </div>
          </form>
        </aside>
      ) : null}
    </>
  );
}
