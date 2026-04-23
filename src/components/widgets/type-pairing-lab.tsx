"use client";

import { useMemo, useState } from "react";

/**
 * TypePairingLab — plan §7 widget #3.
 * User picks a display font and a body font. Widget renders the specimen
 * and emits a short heuristic verdict about the pair.
 *
 * Scope: a curated static list of 7 fonts preloaded via next/font (see
 * `layout.tsx`). No runtime Google Fonts API — that'd mean an uncontrolled
 * network request per keystroke, which is a performance nightmare.
 */

type Classification = "serif-display" | "serif-text" | "sans-neutral" | "sans-geometric";

type FontOption = {
  id: string;
  label: string;
  // CSS var, pre-loaded via next/font in app/layout.tsx
  cssVar: string;
  classification: Classification;
};

const FONTS: FontOption[] = [
  {
    id: "newsreader",
    label: "Newsreader",
    cssVar: "var(--font-display-latin), var(--font-display-cyr), Georgia, serif",
    classification: "serif-text",
  },
  {
    id: "pt-serif",
    label: "PT Serif",
    cssVar: "var(--font-display-cyr), Georgia, serif",
    classification: "serif-text",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    cssVar: "var(--font-pair-playfair), Georgia, serif",
    classification: "serif-display",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    cssVar: "var(--font-pair-fraunces), Georgia, serif",
    classification: "serif-display",
  },
  {
    id: "inter",
    label: "Inter",
    cssVar: "var(--font-sans), system-ui, sans-serif",
    classification: "sans-neutral",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    cssVar: "var(--font-pair-space-grotesk), system-ui, sans-serif",
    classification: "sans-geometric",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    cssVar: "var(--font-mono), ui-monospace, monospace",
    classification: "sans-neutral", // close enough for pair evaluation
  },
];

const DEFAULT_DISPLAY = "playfair";
const DEFAULT_BODY = "inter";

function evaluatePair(display: FontOption, body: FontOption): string {
  if (display.id === body.id) {
    return "Одна гарнитура. Работает при очень разном весе и размере — но редко и только у опытных типографов.";
  }

  const d = display.classification;
  const b = body.classification;

  if (d.startsWith("serif") && b.startsWith("sans")) {
    return "Классическое сочетание: серифный заголовок и гротеск для текста. Высокий контраст классов, читается надёжно.";
  }
  if (d.startsWith("sans") && b.startsWith("serif")) {
    return "Сан-сериф в заголовке и серифный в теле — редкая, но рабочая пара. Хорошо для длинного чтения с современным настроением.";
  }
  if (d === "serif-display" && b === "serif-text") {
    return "Два серифа, но разные роли: дисплейный для заголовков и текстовый для чтения. Нужно следить за контрастом — размер должен сильно отличаться.";
  }
  if (d === "serif-text" && b === "serif-text") {
    return "Два текстовых серифа. Почти всегда плоско. Иерархия будет строиться только на размере и весе — сложнее.";
  }
  if (d === "sans-geometric" && b === "sans-neutral") {
    return "Геометрический сан-сериф в заголовке + нейтральный в тексте. Современное сочетание, типично для стартап-лендингов.";
  }
  if (d === "sans-neutral" && b === "sans-neutral") {
    return "Две нейтральные сан-серифные гарнитуры. Без контраста класса — рискуете плоскостью. Спасает только очень разный вес.";
  }
  if (d === "sans-geometric" && b === "sans-geometric") {
    return "Два геометрических гротеска. Часто перебор — экран становится жёстким и однообразным.";
  }
  return "Нейтральное сочетание. Проверьте, достаточно ли разницы в характере и контрасте.";
}

export function TypePairingLab() {
  const [displayId, setDisplayId] = useState(DEFAULT_DISPLAY);
  const [bodyId, setBodyId] = useState(DEFAULT_BODY);

  const display = useMemo(
    () => FONTS.find((f) => f.id === displayId) ?? FONTS[0],
    [displayId],
  );
  const body = useMemo(
    () => FONTS.find((f) => f.id === bodyId) ?? FONTS[0],
    [bodyId],
  );
  const verdict = useMemo(
    () => evaluatePair(display, body),
    [display, body],
  );

  function randomize() {
    const d = FONTS[Math.floor(Math.random() * FONTS.length)];
    let b = FONTS[Math.floor(Math.random() * FONTS.length)];
    // Prefer a non-identical body so we don't always land on "one family".
    if (b.id === d.id) {
      const others = FONTS.filter((f) => f.id !== d.id);
      b = others[Math.floor(Math.random() * others.length)];
    }
    setDisplayId(d.id);
    setBodyId(b.id);
  }

  return (
    <div className="flex flex-col gap-8" style={{ padding: "16px 0" }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-8">
        <FontSelect
          label="Display / заголовок"
          value={displayId}
          onChange={setDisplayId}
        />
        <FontSelect
          label="Body / текст"
          value={bodyId}
          onChange={setBodyId}
        />
        <button
          type="button"
          onClick={randomize}
          className="self-start text-caption text-cinnabar motion-micro hover:underline underline-offset-4"
        >
          Случайная пара →
        </button>
      </div>

      <div
        aria-hidden
        className="h-px w-full bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />

      <div className="flex flex-col gap-6">
        <h2
          style={{
            fontFamily: display.cssVar,
            fontSize: "48px",
            lineHeight: "56px",
            fontWeight: 400,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          Типографика
        </h2>
        <h3
          style={{
            fontFamily: display.cssVar,
            fontSize: "27px",
            lineHeight: "36px",
            fontWeight: 500,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          Пара шрифтов — это разговор двух голосов
        </h3>
        <p
          style={{
            fontFamily: body.cssVar,
            fontSize: "17px",
            lineHeight: "28px",
            color: "var(--ink)",
            maxWidth: "56ch",
            margin: 0,
          }}
        >
          Хорошая пара строится на контрасте класса — серифный заголовок и
          гротеск в тексте — или на контрасте ролей: дисплейный и текстовый
          шрифт одной семьи. Плоская пара утомляет глаз и не создаёт иерархии.
        </p>
      </div>

      <div
        aria-hidden
        className="h-px w-full bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />

      <div className="flex flex-col gap-2">
        <p className="text-caption text-ochre">Оценка пары</p>
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
          {verdict}
        </p>
      </div>
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const id = `font-${label}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption text-ink-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-ink bg-transparent"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          lineHeight: "24px",
          padding: "6px 24px 6px 0",
          borderBottom: "0.5px solid var(--rule)",
          borderRadius: 0,
          outline: "none",
          minWidth: "180px",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage:
            "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
          backgroundPosition:
            "calc(100% - 8px) 14px, calc(100% - 4px) 14px",
          backgroundSize: "4px 4px, 4px 4px",
          backgroundRepeat: "no-repeat",
        }}
      >
        {FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}
