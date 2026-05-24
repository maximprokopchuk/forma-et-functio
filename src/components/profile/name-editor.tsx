"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

/**
 * Name edit field. Persists via PATCH /api/user/preferences and refreshes
 * the next-auth session so the JWT-cached name (used in the header) catches
 * up immediately without a sign-out/sign-in cycle.
 */
export function NameEditor({ initial }: { initial: string }) {
  const { update } = useSession();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const trimmed = value.trim();
  const dirty = trimmed.length > 0 && trimmed !== initial;

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      await update();
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label
      className="flex flex-col"
      style={{ gap: "6px", maxWidth: "320px" }}
    >
      <span className="text-caption text-ink-muted">Имя</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
        disabled={saving}
        maxLength={120}
        className="border-b border-rule bg-transparent text-ink motion-micro focus:border-cinnabar focus:outline-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          lineHeight: "26px",
          paddingBlock: "4px",
        }}
      />
      {error ? (
        <span className="text-caption text-cinnabar-on-paper">{error}</span>
      ) : savedAt ? (
        <span className="text-caption text-ink-muted">Сохранено</span>
      ) : (
        <span className="text-caption text-ink-muted">
          Отображается в шапке и профиле. Сохраняется при потере фокуса.
        </span>
      )}
    </label>
  );
}
