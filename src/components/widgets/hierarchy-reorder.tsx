"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HierarchyReorder — plan §7 widget #1.
 * User reorders labelled items via up/down buttons; click "Проверить"
 * to compare against `solution`.
 *
 * dnd-kit is intentionally not used — v1 uses arrow-buttons only.
 * Keyboard support: each button is a native <button>, reachable by Tab,
 * activated with Enter/Space. No sticky-pick-up mode in v1.
 */

type Item = { id: string; label: string };

export function HierarchyReorder({
  items,
  solution,
  hint,
}: {
  items: Item[];
  solution: string[];
  hint?: string;
}) {
  const [order, setOrder] = useState<Item[]>(() => items);
  const [checked, setChecked] = useState<"pending" | "correct" | "wrong">(
    "pending",
  );

  // Indexes in the current order that are in the wrong slot — underlined
  // with cinnabar when the attempt was wrong.
  const wrongIndexes = useMemo(() => {
    if (checked !== "wrong") return new Set<number>();
    const wrong = new Set<number>();
    order.forEach((item, idx) => {
      if (item.id !== solution[idx]) wrong.add(idx);
    });
    return wrong;
  }, [checked, order, solution]);

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    if (checked !== "pending") setChecked("pending");
  }

  function check() {
    const isCorrect = order.every((item, idx) => item.id === solution[idx]);
    setChecked(isCorrect ? "correct" : "wrong");
  }

  function reset() {
    setOrder(items);
    setChecked("pending");
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 motion-small",
        checked === "correct" && "bg-cinnabar/5",
      )}
      style={{ padding: "16px 0" }}
    >
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />

      <ol className="flex flex-col">
        {order.map((item, idx) => {
          const isWrong = wrongIndexes.has(idx);
          return (
            <li
              key={item.id}
              className="flex items-center gap-4 border-b border-rule py-3"
            >
              <span
                className="text-mono text-ink-muted tabular-nums"
                style={{ minWidth: "24px" }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "flex-1 text-ink",
                  isWrong && "underline decoration-cinnabar decoration-[0.5px] underline-offset-4",
                )}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                  lineHeight: "28px",
                }}
              >
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  aria-label={`Поднять «${item.label}» выше`}
                  className="motion-micro p-2 text-ink hover:text-cinnabar disabled:text-rule disabled:hover:text-rule"
                >
                  <ChevronUp size={18} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === order.length - 1}
                  aria-label={`Опустить «${item.label}» ниже`}
                  className="motion-micro p-2 text-ink hover:text-cinnabar disabled:text-rule disabled:hover:text-rule"
                >
                  <ChevronDown size={18} strokeWidth={1.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={check}
          className="text-caption text-cinnabar motion-micro hover:underline underline-offset-4"
        >
          Проверить →
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-caption text-ink-muted motion-micro hover:text-ink"
        >
          Сбросить
        </button>
      </div>

      {checked === "correct" && (
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            lineHeight: "28px",
          }}
        >
          Точно. Иерархия читается сверху вниз.
        </p>
      )}

      {checked === "wrong" && hint && (
        <p
          className="text-ink-muted"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "15px",
            lineHeight: "24px",
          }}
        >
          {hint}
        </p>
      )}

      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
      />
    </div>
  );
}
