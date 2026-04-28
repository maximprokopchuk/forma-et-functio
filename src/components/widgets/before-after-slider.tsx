"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

/**
 * BeforeAfterSlider — plan §7 v2 widget #6.
 *
 * Two stacked images, the "after" one clipped horizontally by a vertical
 * divider the user drags. Pins can be placed at relative coordinates to call
 * out specific differences; pins on the hidden side fade.
 *
 * Pedagogy: redesigns, type ladders, color-system swaps, refactors. The same
 * widget covers any "show two versions side-by-side" use case.
 *
 * A11y:
 *   - `role="slider"` on the divider handle, ArrowLeft/Right move 5%, Shift
 *     moves 20%; Home/End jump to 0/100.
 *   - `aria-valuetext` reads percentages back as "X процентов «после»".
 *   - Pins are real <button>s, focusable, with announce-on-focus labels.
 *   - prefers-reduced-motion: drag still works, but transitions on the divider
 *     drop to 0ms.
 */

export type BeforeAfterAnnotation = {
  /** Position as percentage of widget width, 0..100. */
  x: number;
  /** Position as percentage of widget height, 0..100. */
  y: number;
  /** Which side this annotation belongs to — fades when hidden. */
  side: "before" | "after";
  /** Short label rendered on hover/focus. */
  label: string;
};

type Props = {
  beforeSrc: string;
  afterSrc: string;
  /** Short caption for the "before" version (smallcaps overlay). */
  beforeLabel?: string;
  /** Short caption for the "after" version. */
  afterLabel?: string;
  /** Alt text shared across both images. */
  alt: string;
  /** Initial divider position 0..100 (default 50). */
  initialPosition?: number;
  /** Aspect ratio as `width / height` (default 16/9). Applied to the frame. */
  aspectRatio?: number;
  /** Optional pins. */
  annotations?: BeforeAfterAnnotation[];
};

const STEP_SMALL = 5;
const STEP_LARGE = 20;

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "до",
  afterLabel = "после",
  alt,
  initialPosition = 50,
  aspectRatio = 16 / 9,
  annotations = [],
}: Props) {
  const [position, setPosition] = useState(() => clamp(initialPosition));
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!dragging) return;
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const next = ((e.clientX - rect.left) / rect.width) * 100;
      setPosition(clamp(next));
    },
    [dragging],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? STEP_LARGE : STEP_SMALL;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        setPosition((p) => clamp(p - step));
        return;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        setPosition((p) => clamp(p + step));
        return;
      case "Home":
        e.preventDefault();
        setPosition(0);
        return;
      case "End":
        e.preventDefault();
        setPosition(100);
        return;
    }
  }, []);

  const valueText = `${Math.round(position)} процентов «${afterLabel}»`;

  return (
    <figure
      ref={frameRef}
      className="relative w-full overflow-hidden border border-rule bg-paper"
      style={
        {
          aspectRatio: String(aspectRatio),
          touchAction: "none",
          "--bf-pos": `${position}%`,
        } as CSSProperties
      }
      aria-labelledby={labelId}
    >
      {/* Before — full background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full select-none object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />

      {/* After — clipped from left by `position` */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: "inset(0 0 0 var(--bf-pos))" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt=""
          className="h-full w-full select-none object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Side captions — corner overlays */}
      <p className="pointer-events-none absolute left-3 top-3 text-caption text-paper bg-ink/70 px-2 py-1">
        {beforeLabel}
      </p>
      <p className="pointer-events-none absolute right-3 top-3 text-caption text-paper bg-ink/70 px-2 py-1">
        {afterLabel}
      </p>

      {/* Annotations */}
      {annotations.map((a, i) => {
        const hidden = a.side === "after" ? position > a.x : position < a.x;
        return (
          <Annotation
            key={i}
            x={a.x}
            y={a.y}
            label={a.label}
            faded={hidden}
          />
        );
      })}

      {/* Divider line + handle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 bg-cinnabar"
        style={{ width: "1px", left: "var(--bf-pos)", transform: "translateX(-0.5px)" }}
      />

      <button
        type="button"
        role="slider"
        aria-label="Сравнение до и после"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={valueText}
        aria-orientation="horizontal"
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border border-cinnabar bg-paper focus:outline-none focus:ring-2 focus:ring-cinnabar focus:ring-offset-2 focus:ring-offset-paper"
        style={{ left: "var(--bf-pos)", width: "32px", height: "32px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span aria-hidden className="block leading-none text-cinnabar">
          ⇋
        </span>
      </button>

      <figcaption id={labelId} className="sr-only">
        {alt}. Перемещайте ручку, чтобы сравнить «{beforeLabel}» и «{afterLabel}».
        Стрелки сдвигают на 5%, с зажатым Shift — на 20%, Home и End — к краям.
      </figcaption>
    </figure>
  );
}

function Annotation({
  x,
  y,
  label,
  faded,
}: {
  x: number;
  y: number;
  label: string;
  faded: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        opacity: faded ? 0.25 : 1,
        transition: "opacity 240ms cubic-bezier(0.2,0,0.1,1)",
      }}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={label}
        title={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="block rounded-full border border-cinnabar bg-paper focus:outline-none focus:ring-2 focus:ring-cinnabar focus:ring-offset-2 focus:ring-offset-paper"
        style={{ width: "16px", height: "16px" }}
      />
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute left-5 top-0 whitespace-nowrap text-caption text-ink bg-paper border border-rule px-2 py-1"
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function clamp(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
