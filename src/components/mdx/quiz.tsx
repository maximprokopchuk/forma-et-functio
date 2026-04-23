"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Option = {
  text: string;
  correct?: boolean;
};

/**
 * Quiz — inline knowledge check.
 * 4 options, click to answer, immediate feedback. Ochre hairlines frame the
 * block; caption `ПРОВЕРКА`. Correct answer flashes cinnabar, wrong stays
 * ink-muted with a tiny note.
 */
export function Quiz({
  question,
  options,
}: {
  question: string;
  options: Option[];
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const isAnswered = selected !== null;
  const selectedOption = isAnswered ? options[selected] : null;
  const isCorrect = selectedOption?.correct === true;

  return (
    <figure
      className="flex flex-col gap-4"
      style={{ marginBlock: "40px" }}
    >
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <div className="flex flex-col gap-3">
        <p className="text-caption text-ochre">Проверка</p>
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "19px",
            lineHeight: "28px",
          }}
        >
          {question}
        </p>
      </div>

      <ul className="flex flex-col gap-2" role="list">
        {options.map((opt, idx) => {
          const chosen = selected === idx;
          const revealsCorrect = isAnswered && opt.correct === true;
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => setSelected(idx)}
                disabled={isAnswered}
                className={cn(
                  "group flex w-full items-start gap-4 border-b border-rule py-3 text-left motion-small",
                  !isAnswered && "hover:bg-[oklch(0.94_0.01_85)]",
                  chosen && isCorrect && "text-cinnabar",
                  chosen && !isCorrect && "text-ink-muted",
                  !chosen && revealsCorrect && "text-cinnabar",
                )}
              >
                <span
                  className="text-mono text-ink-muted tabular-nums"
                  style={{ minWidth: "24px" }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span
                  className="text-ink"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "17px",
                    lineHeight: "28px",
                  }}
                >
                  {opt.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {isAnswered && (
        <p className="text-caption text-ink-muted">
          {isCorrect ? "Верно." : "Не совсем. Посмотрите правильный вариант выше."}
        </p>
      )}

      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
      />
    </figure>
  );
}
