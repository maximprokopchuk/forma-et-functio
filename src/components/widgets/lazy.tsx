"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * LazyMount — mount children only when the container enters the viewport.
 * Most widgets are below the fold; deferring their mount keeps initial JS
 * payload for the topic page minimal (plan §12). A 200px `rootMargin`
 * pre-triggers the mount just before scroll reveals the widget so the user
 * doesn't see a placeholder flash.
 */
export function LazyMount({
  children,
  placeholder,
  rootMargin = "200px",
}: {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // If IntersectionObserver isn't available (test/older envs), mount
  // immediately — safer than silently stranding the widget off-screen.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (!ref.current || visible) return;
    const node = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { rootMargin },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref}>
      {visible ? children : (placeholder ?? <WidgetSkeleton />)}
    </div>
  );
}

/**
 * WidgetSkeleton — static flat block, 192px tall, with a small caption.
 * No shimmer, no pulse. Editorial register.
 */
export function WidgetSkeleton({
  label = "Загрузка виджета…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex items-center justify-center bg-paper-hover"
      style={{ height: "192px" }}
      role="status"
      aria-live="polite"
    >
      <p className="text-caption text-ink-muted">{label}</p>
    </div>
  );
}
