"use client";

import { useCallback, useState } from "react";

/**
 * Email-digest opt-out toggle. Persists via PATCH /api/user/preferences with
 * just the `emailDigests` field — the route was extended to skip the
 * onboardingCompleted side-effect for settings-only updates.
 */
export function DigestToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(async () => {
    if (saving) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailDigests: next }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
    } catch (err) {
      setEnabled(!next); // revert
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }, [enabled, saving]);

  return (
    <label
      className="flex items-start cursor-pointer"
      style={{ gap: "12px" }}
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={toggle}
        disabled={saving}
        style={{ marginTop: "4px" }}
      />
      <span className="flex flex-col" style={{ gap: "4px" }}>
        <span
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            lineHeight: "26px",
          }}
        >
          Письмо, когда серия может сгореть
        </span>
        <span className="text-caption text-ink-muted">
          Раз в день, только если серия активна и сегодня ничего не отмечено.
        </span>
        {error ? (
          <span className="text-caption text-cinnabar">{error}</span>
        ) : null}
      </span>
    </label>
  );
}
