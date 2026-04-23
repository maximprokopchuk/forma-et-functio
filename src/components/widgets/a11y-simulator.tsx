"use client";

import { useId, useState } from "react";

/**
 * A11ySimulator — plan §7 widget #5.
 * Radio group selects a vision-simulation filter; a small mock UI snippet
 * renders under the filter. Filters are applied as CSS `filter: url(#...)`
 * referencing inline SVG colour matrices, or as `filter: blur/contrast`
 * for low-vision / glare modes.
 *
 * Radio groups support native arrow-key navigation.
 */

type ModeId =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "lowvision"
  | "glare";

type Mode = {
  id: ModeId;
  label: string;
  description: string;
  filter: string;
};

const MODES: Mode[] = [
  {
    id: "normal",
    label: "Нормальное",
    description:
      "Эталон. Все цвета и контрасты — как задумано. Дальше будем сравнивать с этим.",
    filter: "none",
  },
  {
    id: "protanopia",
    label: "Протанопия",
    description:
      "Нарушение восприятия красного. Красный CTA и красные ошибки теряют отличие от зелёного и коричневого — около 1% мужчин. Нельзя кодировать смысл только цветом.",
    filter: "url(#a11y-protanopia)",
  },
  {
    id: "deuteranopia",
    label: "Дейтеранопия",
    description:
      "Нарушение восприятия зелёного — самый частый тип дальтонизма (~6% мужчин). Схемы «зелёный = ок, красный = ошибка» становятся неразличимыми.",
    filter: "url(#a11y-deuteranopia)",
  },
  {
    id: "tritanopia",
    label: "Тританопия",
    description:
      "Нарушение восприятия синего. Редкое (<0.01%), но разрушает сине-жёлтый контраст — типичный в data-viz.",
    filter: "url(#a11y-tritanopia)",
  },
  {
    id: "lowvision",
    label: "Слабое зрение",
    description:
      "Симуляция лёгкого расфокуса. Проверяет, читается ли текст при замыливании — требует достаточный размер и вес шрифта.",
    filter: "blur(2px)",
  },
  {
    id: "glare",
    label: "Светочувствительность",
    description:
      "Экран на ярком солнце или глаукома: падает контраст, яркость растёт. Тонкие серые надписи исчезают.",
    filter: "contrast(0.6) brightness(1.3)",
  },
];

export function A11ySimulator() {
  const [mode, setMode] = useState<ModeId>("normal");
  const groupName = useId();
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <div className="flex flex-col gap-8" style={{ padding: "16px 0" }}>
      {/* Hidden SVG: colour-matrix filters for colour-blindness simulation.
          Using standard Fishel matrices documented in Chromium a11y sources.
          The <svg> itself takes no space. */}
      <ColourBlindnessFilters />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-caption text-ink-muted">
          Режим симуляции
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {MODES.map((m) => {
            const id = `${groupName}-${m.id}`;
            return (
              <label
                key={m.id}
                htmlFor={id}
                className="flex items-center gap-2 cursor-pointer motion-micro"
              >
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={m.id}
                  checked={mode === m.id}
                  onChange={() => setMode(m.id)}
                  className="accent-cinnabar"
                />
                <span
                  className="text-ink"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "15px",
                    lineHeight: "24px",
                  }}
                >
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div
        aria-hidden
        className="h-px w-full bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />

      {/* Target mock UI — filter applied to a wrapper div.
          Inline hex colours are intentional here: the whole point of the
          widget is to show how a *specific* foreground/background palette
          behaves under simulation. */}
      <div className="flex justify-center">
        <div
          style={{
            filter: current.filter,
            transition: "filter var(--dur-small) var(--ease-paper)",
            width: "100%",
            maxWidth: "480px",
          }}
        >
          <MockCard />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption text-ochre">{current.label}</p>
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
          {current.description}
        </p>
      </div>
    </div>
  );
}

/**
 * Mock card — an intentionally flawed UI: the "Отмена" link uses a low-
 * saturation blue on warm cream and a red CTA. Under deuteranopia/protanopia
 * the two buttons collapse in hue — teaches "don't rely on colour alone".
 */
function MockCard() {
  return (
    <div
      style={{
        background: "#F4EFD8",
        padding: "24px",
        borderRadius: 0,
        border: "0.5px solid #D0C9B3",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          lineHeight: "20px",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "#7B6F58",
          margin: 0,
        }}
      >
        Важно
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "27px",
          lineHeight: "36px",
          fontWeight: 500,
          color: "#14110F",
          margin: "12px 0",
        }}
      >
        Удалить черновик?
      </h3>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: "24px",
          color: "#3B352B",
          margin: 0,
        }}
      >
        Действие нельзя отменить. Продолжите или вернитесь назад.
      </p>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          style={{
            background: "#D8412F",
            color: "#F4F1EA",
            border: "none",
            padding: "10px 16px",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Удалить
        </button>
        <button
          type="button"
          style={{
            background: "transparent",
            color: "#5B7FC7",
            border: "none",
            padding: "10px 8px",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

/**
 * Standard colour-blindness simulation matrices (sRGB).
 * Source: Chromium accessibility documentation / Brettel-Viénot-Mollon.
 * 5×4 matrix per <feColorMatrix> spec: [R1..R4, G1..G4, B1..B4, A1..A4].
 */
function ColourBlindnessFilters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      <filter id="a11y-protanopia">
        <feColorMatrix
          type="matrix"
          values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
        />
      </filter>
      <filter id="a11y-deuteranopia">
        <feColorMatrix
          type="matrix"
          values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
        />
      </filter>
      <filter id="a11y-tritanopia">
        <feColorMatrix
          type="matrix"
          values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
        />
      </filter>
    </svg>
  );
}
