"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Wordmark } from "@/components/layout/wordmark";
import {
  TRACKS,
  TRACK_SLUGS,
  type TrackAccent,
  type TrackSlug,
} from "@/lib/tracks";

type Screen = 1 | 2 | 3 | 4;

type Level = "beginner" | "intermediate" | "advanced";

const LEVELS: { id: Level; label: string; size: number }[] = [
  { id: "beginner", label: "beginner", size: 22 },
  { id: "intermediate", label: "intermediate", size: 40 },
  { id: "advanced", label: "advanced", size: 68 },
];

const LEVEL_TO_BLOOMS: Record<Level, "L1" | "L3" | "L5"> = {
  beginner: "L1",
  intermediate: "L3",
  advanced: "L5",
};

const TRACK_SLUG_TO_ENUM: Record<TrackSlug, string> = {
  foundations: "FOUNDATIONS",
  interface: "INTERFACE",
  experience: "EXPERIENCE",
  craft: "CRAFT",
};

const ACCENT_BG: Record<TrackAccent, string> = {
  cinnabar: "bg-cinnabar",
  lapis: "bg-lapis",
  ochre: "bg-ochre",
  ink: "bg-ink",
};

/**
 * Onboarding — plan §20.4. Four screens, no progress bar, no step indicator.
 * Feels like turning pages of a book.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [screen, setScreen] = useState<Screen>(1);
  const [name, setName] = useState("");
  const [track, setTrack] = useState<TrackSlug | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      preferredTrack: track ? TRACK_SLUG_TO_ENUM[track] : null,
      preferredLevel: level ? LEVEL_TO_BLOOMS[level] : null,
    };
    if (name.trim()) payload.name = name.trim();
    if (goal.trim()) payload.goal = goal.trim();

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(`Ошибка ${res.status}: ${data.error ?? "неизвестная ошибка"}`);
        setSaving(false);
        return;
      }
      await update();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Сетевая ошибка");
      setSaving(false);
      return;
    }
    router.push("/lessons");
  }

  return (
    <div
      className="flex w-full flex-col items-stretch justify-center bg-paper"
      style={{ minHeight: "calc(100vh - 72px)" }}
    >
      {error ? (
        <p
          className="text-caption text-cinnabar"
          style={{
            margin: "24px auto",
            maxWidth: "56ch",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      ) : null}

      {screen === 1 ? (
        <ScreenWelcome
          name={name}
          onName={setName}
          onNext={() => setScreen(2)}
        />
      ) : null}
      {screen === 2 ? (
        <ScreenTrack
          selected={track}
          onSelect={(slug) => {
            setTrack(slug);
            // Give the underline animation a beat, then advance.
            window.setTimeout(() => setScreen(3), 240);
          }}
        />
      ) : null}
      {screen === 3 ? (
        <ScreenLevel
          selected={level}
          onSelect={(lv) => {
            setLevel(lv);
            window.setTimeout(() => setScreen(4), 240);
          }}
        />
      ) : null}
      {screen === 4 ? (
        <ScreenGoal
          goal={goal}
          onGoal={setGoal}
          saving={saving}
          onFinish={finish}
        />
      ) : null}
    </div>
  );
}

function ScreenWelcome({
  name,
  onName,
  onNext,
}: {
  name: string;
  onName: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-12 px-4 py-24 text-center">
      <Wordmark size="xl" />
      <p className="text-body-l text-ink" style={{ maxWidth: "48ch" }}>
        Учебник цифрового дизайна.
      </p>
      <label className="flex flex-col items-center gap-2">
        <span className="text-caption text-ink-muted">Имя (по желанию)</span>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Как вас зовут?"
          className="border-b border-rule bg-transparent text-body text-ink motion-micro focus:border-cinnabar focus:outline-none"
          style={{
            minWidth: "240px",
            paddingBlock: "4px",
            textAlign: "center",
          }}
        />
      </label>
      <button
        type="button"
        onClick={onNext}
        className="text-caption text-cinnabar motion-micro hover:underline"
      >
        Войти →
      </button>
    </div>
  );
}

function ScreenTrack({
  selected,
  onSelect,
}: {
  selected: TrackSlug | null;
  onSelect: (slug: TrackSlug) => void;
}) {
  return (
    <div className="flex w-full flex-col">
      <p
        className="text-caption text-ink-muted"
        style={{ textAlign: "center", marginBlock: "48px 24px" }}
      >
        Выберите трек
      </p>
      {TRACK_SLUGS.map((slug) => {
        const t = TRACKS[slug];
        const isSelected = selected === slug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onSelect(slug)}
            className="group relative block w-full border-t border-rule bg-paper text-left motion-small hover:bg-[oklch(0.94_0.01_85)]"
          >
            <div className="grid-16 relative" style={{ paddingBlock: "40px" }}>
              <span
                aria-hidden
                className={`absolute top-0 bottom-0 w-1 ${ACCENT_BG[t.colorToken]}`}
                style={{ left: "80px" }}
              />
              <div className="col-span-full flex flex-col gap-2 xl:col-span-8 xl:col-start-3">
                <p className="text-caption text-ink-muted">{t.shortTitle}</p>
                <h2 className="text-display-m text-ink">
                  <span className="relative inline-block">
                    {t.title}
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute left-0 -bottom-1 h-px w-full bg-cinnabar motion-small ${
                        isSelected ? "scale-x-100" : "scale-x-0"
                      } origin-left group-hover:scale-x-100`}
                      style={{ transformOrigin: "left bottom" }}
                    />
                  </span>
                </h2>
              </div>
            </div>
          </button>
        );
      })}
      <div
        aria-hidden
        className="border-t border-rule"
        style={{ width: "100%" }}
      />
    </div>
  );
}

function ScreenLevel({
  selected,
  onSelect,
}: {
  selected: Level | null;
  onSelect: (lv: Level) => void;
}) {
  return (
    <div
      className="flex flex-col items-center gap-16 px-4"
      style={{ paddingBlock: "96px" }}
    >
      <p className="text-caption text-ink-muted">Ваш уровень</p>
      <div className="flex flex-col items-center gap-10">
        {LEVELS.map((lv) => {
          const isSelected = selected === lv.id;
          return (
            <button
              key={lv.id}
              type="button"
              onClick={() => onSelect(lv.id)}
              className="motion-small"
              aria-pressed={isSelected}
            >
              <span
                className="relative inline-block text-ink motion-small hover:text-cinnabar"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: `${lv.size}px`,
                  lineHeight: 1.1,
                }}
              >
                {lv.label}
                <span
                  aria-hidden
                  className={`absolute left-0 -bottom-1 h-px w-full bg-cinnabar motion-small ${
                    isSelected ? "scale-x-100" : "scale-x-0"
                  } origin-left`}
                  style={{ transformOrigin: "left bottom" }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenGoal({
  goal,
  onGoal,
  saving,
  onFinish,
}: {
  goal: string;
  onGoal: (v: string) => void;
  saving: boolean;
  onFinish: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center gap-12 px-4"
      style={{ paddingBlock: "96px" }}
    >
      <p
        className="text-body-l text-ink"
        style={{
          fontStyle: "italic",
          fontFamily: "var(--font-display)",
          maxWidth: "40ch",
          textAlign: "center",
        }}
      >
        Что вы хотите научиться делать?
      </p>
      <div
        className="flex flex-col gap-2"
        style={{ width: "100%", maxWidth: "56ch" }}
      >
        <textarea
          value={goal}
          onChange={(e) => onGoal(e.target.value)}
          rows={4}
          className="resize-none bg-transparent text-body text-ink motion-micro focus:outline-none"
          style={{ padding: "8px 0" }}
        />
        <div
          aria-hidden
          className="h-px w-full bg-rule"
          style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
        />
      </div>
      <button
        type="button"
        onClick={onFinish}
        disabled={saving}
        className="text-caption text-cinnabar motion-micro hover:underline disabled:opacity-50"
      >
        {saving ? "Сохранение…" : "Начать чтение →"}
      </button>
    </div>
  );
}
