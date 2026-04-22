"use client";

import { useTheme } from "next-themes";

/**
 * Tiny theme toggle — flips light / dark. Plain text, no shadow.
 * Uses `suppressHydrationWarning` on the label span so next-themes can fill it
 * in after hydration without triggering a mismatch warning.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-caption text-ink motion-micro hover:text-cinnabar"
      aria-label="Переключить тему"
    >
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? "Студия" : "Свет"}
      </span>
    </button>
  );
}
