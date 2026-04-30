/**
 * Plausible custom events helper.
 *
 * Use sparingly — pageviews are tracked automatically. Reserve trackEvent
 * for conversion-shaped signals (Topic Completed, Submission Created,
 * Like Toggled, Streak Lost). Do not log identifiers — Plausible is
 * privacy-respecting on purpose; props should be aggregable categories
 * like track or topic-slug, not user ids.
 *
 * No-op when Plausible isn't loaded (dev / preview / SSR).
 */

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const fn = window.plausible;
  if (typeof fn !== "function") return;
  fn(event, props ? { props } : undefined);
}
