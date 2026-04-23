"use client";

import { useMemo, useState } from "react";

/**
 * SpacingTuner — plan §7 widget #4.
 * Reader adjusts four spacing values on a mock composition and gets a
 * verdict about proximity to the "right" answer. A baseline-grid toggle
 * overlays 8px horizontal rules so the reader can see alignment.
 *
 * Sliders are native <input type="range"> — keyboard-accessible by default.
 */

const TARGET = {
  title: 16,
  body: 24,
  meta: 24,
  padding: 32,
} as const;

type SpacingValues = {
  title: number;
  body: number;
  meta: number;
  padding: number;
};

const DEFAULTS: SpacingValues = {
  title: 8,
  body: 8,
  meta: 8,
  padding: 16,
};

function isCloseEnough(v: SpacingValues): boolean {
  return (
    Math.abs(v.title - TARGET.title) <= 4 &&
    Math.abs(v.body - TARGET.body) <= 4 &&
    Math.abs(v.meta - TARGET.meta) <= 4 &&
    Math.abs(v.padding - TARGET.padding) <= 4
  );
}

function onBaseline(v: SpacingValues): boolean {
  return Object.values(v).every((x) => x % 8 === 0);
}

export function SpacingTuner() {
  const [values, setValues] = useState<SpacingValues>(DEFAULTS);
  const [gridOn, setGridOn] = useState(false);

  const close = useMemo(() => isCloseEnough(values), [values]);
  const baseline = useMemo(() => onBaseline(values), [values]);

  function set<K extends keyof SpacingValues>(key: K, value: number) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function reset() {
    setValues(DEFAULTS);
  }

  return (
    <div className="flex flex-col gap-8" style={{ padding: "16px 0" }}>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Sliders — left column */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <SpacingSlider
            label="Отступ под заголовком"
            value={values.title}
            onChange={(v) => set("title", v)}
          />
          <SpacingSlider
            label="Отступ под текстом"
            value={values.body}
            onChange={(v) => set("body", v)}
          />
          <SpacingSlider
            label="Отступ под метой"
            value={values.meta}
            onChange={(v) => set("meta", v)}
          />
          <SpacingSlider
            label="Паддинг контейнера"
            value={values.padding}
            max={64}
            onChange={(v) => set("padding", v)}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gridOn}
                onChange={(e) => setGridOn(e.target.checked)}
                className="accent-cinnabar"
              />
              <span className="text-caption text-ink">Сетка 8px</span>
            </label>
            <button
              type="button"
              onClick={reset}
              className="text-caption text-ink-muted motion-micro hover:text-ink"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Composition — right column */}
        <div className="lg:col-span-7">
          <div
            className="relative"
            style={{
              padding: `${values.padding}px`,
              background: "var(--paper)",
              outline: "0.5px dashed var(--rule)",
            }}
          >
            {gridOn ? <BaselineGrid /> : null}
            <div
              className="relative"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "34px",
                lineHeight: "40px",
                fontWeight: 500,
                color: "var(--ink)",
                marginBottom: `${values.title}px`,
              }}
            >
              Важное сообщение
            </div>
            <div
              className="relative"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                lineHeight: "28px",
                color: "var(--ink)",
                maxWidth: "46ch",
                marginBottom: `${values.body}px`,
              }}
            >
              Короткий абзац, объясняющий, что именно предлагается сделать.
              Иерархия и пространство решают, насколько быстро читатель
              поймёт суть.
            </div>
            <div
              className="relative text-caption"
              style={{
                color: "var(--ink-muted)",
                marginBottom: `${values.meta}px`,
              }}
            >
              Обновлено 22 апреля
            </div>
            <div className="relative">
              <button
                type="button"
                className="motion-micro"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--paper-on-accent)",
                  background: "var(--cinnabar)",
                  padding: "12px 20px",
                  borderRadius: 0,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption text-ochre">Оценка</p>
        <p
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "17px",
            lineHeight: "28px",
            maxWidth: "56ch",
          }}
        >
          {close && baseline
            ? "Близко: всё кратно 8, иерархия читается."
            : close
              ? "Соотношения правильные, но не все значения на 8-пиксельной сетке."
              : baseline
                ? "Значения на сетке, но пропорции пока плоские. Попробуйте увеличить отступы вокруг текста."
                : "Пропорции смазаны. Сначала выровняйте всё по 8 — включите сетку."}
        </p>
      </div>
    </div>
  );
}

function SpacingSlider({
  label,
  value,
  onChange,
  max = 48,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const id = `spacing-${label}`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-caption text-ink">
          {label}
        </label>
        <span className="text-mono text-ink-muted tabular-nums">
          {value}px
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={4}
        value={value}
        aria-valuetext={`${value} пикселей`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="editorial-range"
      />
    </div>
  );
}

/**
 * 8px baseline overlay. Absolute-positioned lines every 8px down the parent.
 */
function BaselineGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0 7px, color-mix(in oklch, var(--cinnabar) 22%, transparent) 7px 8px)",
      }}
    />
  );
}
