"use client";

import { useMemo, useState } from "react";
// apca-w3 ships as ES modules with no type declarations — treat the export
// as a narrow number-returning function through a module-augmentation shim
// declared below.
// @ts-expect-error — no types published for apca-w3 yet
import { calcAPCA } from "apca-w3";

/**
 * ColorContrastSandbox — plan §7 widget #2.
 * User picks foreground + background, sees WCAG 2.2 ratio, APCA Lc, and a
 * framed live preview across three type sizes.
 *
 * Defaults match the site palette: ink on paper.
 * Native `<input type="color">` is keyboard-accessible (arrows in the popup
 * picker). All metrics re-compute on change.
 */

const INK_HEX = "#14110F";
const PAPER_HEX = "#F4F1EA";

// --- WCAG 2.2 contrast ratio (simple relative-luminance pipe) ---
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function relLuminance(rgb: [number, number, number]): number {
  const [R, G, B] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function wcagRatio(fg: string, bg: string): number {
  const Lfg = relLuminance(hexToRgb(fg));
  const Lbg = relLuminance(hexToRgb(bg));
  const brighter = Math.max(Lfg, Lbg);
  const darker = Math.min(Lfg, Lbg);
  return (brighter + 0.05) / (darker + 0.05);
}

// APCA returns a signed Lc (-108…+106). We display |Lc| to the user,
// since the sign only denotes polarity (dark-on-light vs light-on-dark).
function apcaLc(fg: string, bg: string): number {
  const raw = (calcAPCA as (fg: string, bg: string) => number | string)(
    fg,
    bg,
  );
  const n = typeof raw === "number" ? raw : parseFloat(raw);
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

function apcaVerdict(lc: number): { label: string; tone: "good" | "edge" | "bad" } {
  if (lc >= 75) return { label: "Достаточно", tone: "good" };
  if (lc >= 60) return { label: "Приемлемо для тела", tone: "good" };
  if (lc >= 45) return { label: "Только крупный текст", tone: "edge" };
  if (lc >= 30) return { label: "На границе", tone: "edge" };
  return { label: "Мало", tone: "bad" };
}

export function ColorContrastSandbox() {
  const [fg, setFg] = useState(INK_HEX);
  const [bg, setBg] = useState(PAPER_HEX);

  const ratio = useMemo(() => wcagRatio(fg, bg), [fg, bg]);
  const lc = useMemo(() => apcaLc(fg, bg), [fg, bg]);
  const verdict = useMemo(() => apcaVerdict(lc), [lc]);

  function reset() {
    setFg(INK_HEX);
    setBg(PAPER_HEX);
  }

  return (
    <div
      className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-8"
      style={{ padding: "16px 0" }}
    >
      {/* Left: pickers + metrics */}
      <div className="flex flex-col gap-6 lg:col-span-5">
        <div className="flex flex-col gap-4">
          <ColorField
            label="Текст"
            hex={fg}
            onChange={setFg}
          />
          <ColorField
            label="Фон"
            hex={bg}
            onChange={setBg}
          />
        </div>

        <div
          aria-hidden
          className="h-px w-full bg-rule"
          style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
        />

        <dl className="flex flex-col gap-4">
          <Metric
            label="WCAG 2.2"
            value={`${ratio.toFixed(2)} : 1`}
          >
            <div className="flex gap-2 flex-wrap">
              <Badge pass={ratio >= 4.5} label="AA · текст" />
              <Badge pass={ratio >= 7} label="AAA · текст" />
              <Badge pass={ratio >= 3} label="AA · крупный" />
            </div>
          </Metric>

          <Metric
            label="APCA"
            value={`Lc ${Math.round(lc)}`}
          >
            <p
              className="text-caption"
              style={{
                color:
                  verdict.tone === "good"
                    ? "var(--lapis)"
                    : verdict.tone === "edge"
                      ? "var(--ochre)"
                      : "var(--cinnabar)",
              }}
            >
              {verdict.label}
            </p>
          </Metric>
        </dl>

        <button
          type="button"
          onClick={reset}
          className="self-start text-caption text-ink-muted motion-micro hover:text-ink"
        >
          Сбросить
        </button>
      </div>

      {/* Right: live preview */}
      <div className="lg:col-span-7">
        <div
          className="border border-rule"
          style={{
            background: bg,
            color: fg,
            padding: "32px",
            borderWidth: "0.5px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              lineHeight: "20px",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: "16px",
            }}
          >
            Превью
          </p>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "34px",
              lineHeight: "40px",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Типографика решает
          </h3>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              lineHeight: "28px",
              marginBottom: "16px",
              maxWidth: "46ch",
            }}
          >
            Контраст — это не про «красиво», а про читаемость. Правильная пара
            цветов даёт возможность читать долго без усталости глаз. Неверная —
            отпугивает пользователя за три секунды.
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              lineHeight: "20px",
              opacity: 0.8,
            }}
          >
            Подпись, сноска, метаданные — такой размер.
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  hex,
  onChange,
}: {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
}) {
  const id = `color-${label}`;
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor={id}
        className="text-caption text-ink"
        style={{ minWidth: "56px" }}
      >
        {label}
      </label>
      {/* Native color input — keyboard-accessible popup. 24×24 swatch. */}
      <input
        id={id}
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: "24px",
          height: "24px",
          padding: 0,
          border: "0.5px solid var(--rule)",
          background: "transparent",
        }}
        aria-label={`${label} — hex ${hex}`}
      />
      <input
        type="text"
        value={hex.toUpperCase()}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
          else if (/^#[0-9A-Fa-f]{3}$/.test(v)) onChange(v);
        }}
        aria-label={`${label} — HEX код`}
        className="text-mono text-ink bg-transparent"
        style={{
          width: "100px",
          borderBottom: "0.5px solid var(--rule)",
          padding: "4px 0",
          outline: "none",
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-rule pb-4">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="flex flex-col gap-2">
        <span
          className="text-ink tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "27px",
            lineHeight: "36px",
          }}
        >
          {value}
        </span>
        {children}
      </dd>
    </div>
  );
}

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className="text-caption"
      style={{
        borderWidth: "0.5px",
        borderStyle: "solid",
        borderColor: pass ? "var(--lapis)" : "var(--cinnabar)",
        color: pass ? "var(--lapis)" : "var(--cinnabar)",
        padding: "2px 8px",
      }}
    >
      {pass ? "✓" : "×"} {label}
    </span>
  );
}
