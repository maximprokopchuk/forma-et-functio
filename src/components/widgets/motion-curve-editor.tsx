"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * MotionCurveEditor — plan §7 v2 widget #13.
 *
 * SVG-based cubic-bezier editor: two draggable handles (P1, P2) on a 0–1
 * grid, the curve is drawn through (0,0) and (1,1), and a small dot
 * animates along the curve once per cycle so the user feels what their
 * easing actually does to motion.
 *
 * Pedagogy: ease-in vs ease-out vs ease-in-out vs Material "emphasized".
 * Pair with the Motion-in-UI lesson; useful anywhere readers need to
 * internalise that the same path with different easings reads as a
 * different gesture.
 *
 * A11y:
 *   - Each handle is a real <button role="slider"> reachable via Tab.
 *     Arrow keys nudge by 0.05; Shift+Arrow by 0.2; Home/End jump to 0/1
 *     on the X axis. Y is announced as separate axis with up/down.
 *   - aria-valuetext reads "X 0.20, Y 0.00".
 *   - prefers-reduced-motion: animation pauses; the curve and handles
 *     remain interactive.
 */

const PRESETS: Array<{
  name: string;
  values: [number, number, number, number];
  description: string;
}> = [
  { name: "linear", values: [0, 0, 1, 1], description: "Постоянная скорость" },
  { name: "ease-out", values: [0, 0, 0.2, 1], description: "Быстрый старт, мягкая остановка — для входа" },
  { name: "ease-in", values: [0.4, 0, 1, 1], description: "Медленный старт, ускорение — для выхода" },
  { name: "ease-in-out", values: [0.4, 0, 0.2, 1], description: "S-кривая для переходов между состояниями" },
  { name: "emphasized", values: [0.2, 0, 0, 1], description: "Material 3 motion — основная кривая системы" },
];

type Vec = [number, number];

type Props = {
  initial?: [number, number, number, number];
  /** SVG side length in px. Visual only — values are stored 0..1. */
  size?: number;
};

export function MotionCurveEditor({
  initial = [0.2, 0, 0, 1],
  size = 280,
}: Props) {
  const [p1, setP1] = useState<Vec>([initial[0], initial[1]]);
  const [p2, setP2] = useState<Vec>([initial[2], initial[3]]);
  const [reduced, setReduced] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const cssCurve = `cubic-bezier(${formatNum(p1[0])}, ${formatNum(p1[1])}, ${formatNum(p2[0])}, ${formatNum(p2[1])})`;

  // SVG path: from (0, size) to (size, 0), control points reflect handles.
  const pathD = useMemo(() => {
    const x0 = 0;
    const y0 = size;
    const x1 = p1[0] * size;
    const y1 = size - p1[1] * size;
    const x2 = p2[0] * size;
    const y2 = size - p2[1] * size;
    const x3 = size;
    const y3 = 0;
    return `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
  }, [p1, p2, size]);

  const onPreset = useCallback(
    (values: [number, number, number, number]) => {
      setP1([values[0], values[1]]);
      setP2([values[2], values[3]]);
    },
    [],
  );

  const copy = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(cssCurve).catch(() => {
      // Clipboard can be denied in iframes / insecure origins; silently
      // ignore — the value is also shown selectable in the readout.
    });
  }, [cssCurve]);

  return (
    <div className="flex flex-col" style={{ gap: "20px" }}>
      <div
        className="flex flex-wrap items-start"
        style={{ gap: "32px" }}
      >
        <CurveSvg
          svgRef={svgRef}
          size={size}
          pathD={pathD}
          p1={p1}
          p2={p2}
          setP1={setP1}
          setP2={setP2}
          reduced={reduced}
        />

        <div className="flex flex-col" style={{ gap: "16px", minWidth: "200px" }}>
          <div className="flex flex-col" style={{ gap: "6px" }}>
            <p className="text-caption text-ink-muted">Готовые кривые</p>
            <div className="flex flex-wrap" style={{ gap: "6px" }}>
              {PRESETS.map((preset) => {
                const active =
                  preset.values[0] === p1[0] &&
                  preset.values[1] === p1[1] &&
                  preset.values[2] === p2[0] &&
                  preset.values[3] === p2[1];
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onPreset(preset.values)}
                    title={preset.description}
                    aria-pressed={active}
                    className="text-caption motion-micro"
                    style={{
                      padding: "4px 10px",
                      border: "0.5px solid var(--rule)",
                      letterSpacing: "0.05em",
                      color: active ? "var(--cinnabar)" : "var(--ink)",
                      borderColor: active ? "var(--cinnabar)" : "var(--rule)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "6px" }}>
            <p className="text-caption text-ink-muted">CSS</p>
            <code
              className="text-ink"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                padding: "8px 10px",
                border: "0.5px solid var(--rule)",
                userSelect: "all",
                wordBreak: "break-all",
              }}
            >
              {cssCurve}
            </code>
            <button
              type="button"
              onClick={copy}
              className="self-start text-caption text-ink-muted motion-micro hover:text-cinnabar"
            >
              Скопировать ↗
            </button>
          </div>
        </div>
      </div>

      <Preview cssCurve={cssCurve} reduced={reduced} />
    </div>
  );
}

type SvgProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  size: number;
  pathD: string;
  p1: Vec;
  p2: Vec;
  setP1: (v: Vec) => void;
  setP2: (v: Vec) => void;
  reduced: boolean;
};

function CurveSvg({
  svgRef,
  size,
  pathD,
  p1,
  p2,
  setP1,
  setP2,
  reduced,
}: SvgProps) {
  return (
    <svg
      ref={svgRef}
      viewBox={`-16 -16 ${size + 32} ${size + 32}`}
      width={size + 32}
      height={size + 32}
      style={{ touchAction: "none" }}
      aria-label="Cubic-bezier-кривая. Точки P1 и P2 управляют формой."
    >
      {/* Plot area */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="var(--paper)"
        stroke="var(--rule)"
        strokeWidth={0.5}
      />
      {/* Diagonal — linear reference */}
      <line
        x1={0}
        y1={size}
        x2={size}
        y2={0}
        stroke="var(--rule)"
        strokeWidth={0.5}
        strokeDasharray="4 4"
      />
      {/* Anchor labels */}
      <text x={2} y={size - 4} fontSize={10} fill="var(--ink-muted, #5C5752)">
        0,0
      </text>
      <text x={size - 22} y={12} fontSize={10} fill="var(--ink-muted, #5C5752)">
        1,1
      </text>
      {/* Handle lines — connect anchors to control points */}
      <line
        x1={0}
        y1={size}
        x2={p1[0] * size}
        y2={size - p1[1] * size}
        stroke="var(--rule)"
        strokeWidth={0.5}
      />
      <line
        x1={size}
        y1={0}
        x2={p2[0] * size}
        y2={size - p2[1] * size}
        stroke="var(--rule)"
        strokeWidth={0.5}
      />
      {/* Curve */}
      <path d={pathD} fill="none" stroke="var(--cinnabar)" strokeWidth={1.5} />

      {/* Animated dot along the curve */}
      {!reduced ? (
        <circle r={4} fill="var(--cinnabar)">
          <animateMotion dur="2s" repeatCount="indefinite" path={pathD} />
        </circle>
      ) : null}

      <Handle
        x={p1[0]}
        y={p1[1]}
        size={size}
        label="Точка 1"
        onChange={setP1}
      />
      <Handle
        x={p2[0]}
        y={p2[1]}
        size={size}
        label="Точка 2"
        onChange={setP2}
      />
    </svg>
  );
}

function Handle({
  x,
  y,
  size,
  label,
  onChange,
}: {
  x: number;
  y: number;
  size: number;
  label: string;
  onChange: (v: Vec) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGGElement>) => {
      e.preventDefault();
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGGElement>) => {
      if (!dragging) return;
      const svg = (e.currentTarget.ownerSVGElement ?? null) as SVGSVGElement | null;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * (size + 32) - 16;
      const localY = ((e.clientY - rect.top) / rect.height) * (size + 32) - 16;
      // X clamps to [0, 1]; Y is allowed to overshoot a little so users can
      // build springy curves that go above 1 / below 0.
      const nx = clamp(localX / size, 0, 1);
      const ny = clamp(1 - localY / size, -0.5, 1.5);
      onChange([nx, ny]);
    },
    [dragging, size, onChange],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<SVGGElement>) => {
      setDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<SVGGElement>) => {
      const step = e.shiftKey ? 0.2 : 0.05;
      let nx = x;
      let ny = y;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          nx = clamp(x - step, 0, 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          nx = clamp(x + step, 0, 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          ny = clamp(y - step, -0.5, 1.5);
          break;
        case "ArrowUp":
          e.preventDefault();
          ny = clamp(y + step, -0.5, 1.5);
          break;
        case "Home":
          e.preventDefault();
          nx = 0;
          break;
        case "End":
          e.preventDefault();
          nx = 1;
          break;
        default:
          return;
      }
      onChange([nx, ny]);
    },
    [x, y, onChange],
  );

  const cx = x * size;
  const cy = size - y * size;

  return (
    <g
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={`X ${formatNum(x)}, Y ${formatNum(y)}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={{ cursor: dragging ? "grabbing" : "grab", outline: "none" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="var(--paper)"
        stroke="var(--cinnabar)"
        strokeWidth={1.5}
      />
    </g>
  );
}

function Preview({
  cssCurve,
  reduced,
}: {
  cssCurve: string;
  reduced: boolean;
}) {
  // Unique animation name so React doesn't have to re-define keyframes per
  // instance. The preview moves a dot from left to right on a 2s loop, then
  // resets — clear feedback that doesn't compete with the SVG dot.
  const previewStyle: CSSProperties = reduced
    ? { transform: "translateX(0)" }
    : {
        animation: `formaMotionCurveSweep 2s ${cssCurve} infinite`,
      };

  return (
    <div
      className="flex flex-col"
      style={{ gap: "8px" }}
      aria-label="Превью движения по кривой"
    >
      <p className="text-caption text-ink-muted">Превью</p>
      <div
        style={{
          position: "relative",
          height: "32px",
          border: "0.5px solid var(--rule)",
        }}
      >
        <span
          aria-hidden
          className="bg-cinnabar"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            transform: "translateY(-50%)",
            ...previewStyle,
          }}
        />
        <style>{`
          @keyframes formaMotionCurveSweep {
            0% { left: 0; }
            45% { left: calc(100% - 16px); }
            55% { left: calc(100% - 16px); }
            100% { left: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

function formatNum(n: number): string {
  // Two decimals, strip trailing zeros so 0.20 → 0.2.
  const fixed = n.toFixed(2);
  return fixed.replace(/\.?0+$/, "") || "0";
}
