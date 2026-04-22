import { notFound } from "next/navigation";
import Link from "next/link";
import { getMockTrack, getMockLessons, type MockLesson } from "@/lib/mock-data";

/**
 * Track page — plan §20.2.
 * H1 display-l, manifesto body-l, tiny axonometric structure SVG, then a
 * numbered list (no cards) of lessons with progress hairlines.
 */
export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const meta = getMockTrack(track);
  if (!meta) notFound();
  const lessons = getMockLessons(track);

  return (
    <article className="bg-paper" style={{ paddingBlock: "96px" }}>
      <header className="grid-16" style={{ paddingBottom: "64px" }}>
        {/* Title + manifesto in cols 3-12. */}
        <div className="col-span-full flex flex-col gap-8 xl:col-span-10 xl:col-start-3">
          <p className="text-caption text-ink-muted">{meta.shortTitle}</p>
          <h1 className="text-display-l text-ink">{meta.title}</h1>
          <div
            aria-hidden
            className="h-px w-full bg-rule"
            style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
          />
          <p className="text-body-l text-ink reading-measure">
            {meta.manifesto}
          </p>
        </div>

        {/* Cols 13-15: tiny axonometric diagram. */}
        <div className="col-span-full hidden self-start xl:col-span-3 xl:col-start-13 xl:block">
          <StructDiagram count={lessons.length} />
          <p className="mt-2 text-caption text-ink-muted">Структура трека</p>
        </div>
      </header>

      <ul className="border-t border-rule">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <LessonRow trackSlug={meta.slug} lesson={lesson} />
          </li>
        ))}
      </ul>
    </article>
  );
}

function LessonRow({
  trackSlug,
  lesson,
}: {
  trackSlug: string;
  lesson: MockLesson;
}) {
  return (
    <Link
      href={`/lessons/${trackSlug}/${lesson.slug}/overview`}
      className="group block border-b border-rule motion-small hover:bg-[oklch(0.94_0.01_85)]"
    >
      <div className="grid-16" style={{ paddingBlock: "32px" }}>
        {/* Col 3: number — tabular mono 22px. */}
        <div className="col-span-full xl:col-span-1 xl:col-start-3">
          <p
            className="text-mono text-ink-muted tabular-nums"
            style={{ fontSize: "22px", lineHeight: "32px" }}
          >
            {lesson.order.toString().padStart(2, "0")}
          </p>
        </div>

        {/* Col 4-9: title + description. */}
        <div className="col-span-full flex flex-col gap-1 xl:col-span-6 xl:col-start-4">
          <h2 className="text-h3 text-ink">{lesson.title}</h2>
          <p className="text-body-s text-ink-muted">{lesson.description}</p>
        </div>

        {/* Col 10-11: meta (minutes · level). */}
        <div className="col-span-full xl:col-span-2 xl:col-start-10 xl:self-center">
          <p className="text-caption text-ink-muted">
            <span className="tabular-nums">{lesson.minutes}</span> мин ·{" "}
            {lesson.level}
          </p>
        </div>

        {/* Col 13-15: progress hairline — 0.5px cinnabar fill on rule bg. */}
        <div className="col-span-full xl:col-span-3 xl:col-start-13 xl:self-center">
          <ProgressRule progress={lesson.progress} />
        </div>
      </div>
    </Link>
  );
}

function ProgressRule({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div className="relative h-px w-full bg-rule" aria-label={`Прогресс: ${clamped}%`}>
      <div
        className="absolute left-0 top-0 h-full bg-cinnabar"
        style={{ width: `${clamped}%`, transform: "scaleY(1)" }}
      />
    </div>
  );
}

/**
 * Tiny axonometric structure diagram — stacked rectangles at 30°/30°.
 * Purely illustrative placeholder; real dependency graph comes later.
 */
function StructDiagram({ count }: { count: number }) {
  const steps = Array.from({ length: count });
  // axonometric shear: x-offset + y-rise per block.
  const dx = 8;
  const dy = 10;
  const blockW = 60;
  const blockH = 18;
  const totalH = (count - 1) * dy + blockH + 4;
  const totalW = (count - 1) * dx + blockW + 4;
  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="struct-mock"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      className="text-ink"
    >
      {steps.map((_, i) => {
        // top of stack first
        const order = count - 1 - i;
        const x = order * dx + 1;
        const y = (count - 1 - order) * dy + 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={blockW}
              height={blockH}
              strokeWidth={1.5}
            />
            {/* top cap giving axonometric depth */}
            <line x1={x} y1={y} x2={x + dx} y2={y - dy + blockH} strokeWidth={0.5} />
          </g>
        );
      })}
    </svg>
  );
}
