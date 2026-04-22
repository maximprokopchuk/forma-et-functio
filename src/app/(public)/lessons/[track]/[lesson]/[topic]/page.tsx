import Link from "next/link";
import { getMockTrack } from "@/lib/mock-data";
import { LogoMark } from "@/components/layout/wordmark";

/**
 * Topic page scaffold — plan §20.3.
 * Three bands: hero / reading+margin notes / synthesis.
 * All content is mock — real MDX pipeline arrives in Phase 2.
 */
export default async function TopicPage({
  params,
}: {
  params: Promise<{ track: string; lesson: string; topic: string }>;
}) {
  const { track } = await params;
  const meta = getMockTrack(track);
  const trackLabel = meta?.shortTitle ?? "FOUNDATIONS";

  return (
    <article className="bg-paper">
      <BandHero trackLabel={trackLabel} />
      <BandReading />
      <BandSynthesis />
    </article>
  );
}

function BandHero({ trackLabel }: { trackLabel: string }) {
  return (
    <section
      className="relative w-full bg-paper"
      style={{ minHeight: "60vh" }}
      aria-label="Обложка темы"
    >
      {/* Placeholder Munari-style composition — squares in cinnabar on paper. */}
      <HeroComposition />

      {/* Bottom-left breadcrumb, 80px inset to match 16-col outer margin. */}
      <div
        className="absolute bottom-8 left-0 right-0"
        style={{ paddingInline: "80px" }}
      >
        <p className="text-caption text-ink-muted">
          Трек {trackLabel} · Раздел 04 · Тема 03 ·{" "}
          <span className="tabular-nums">14</span> мин
        </p>
      </div>

      {/* Top-right LogoMark linking home. */}
      <div className="absolute right-0 top-0" style={{ padding: "24px 80px" }}>
        <Link
          href="/"
          aria-label="На главную"
          className="text-ink motion-micro hover:text-cinnabar"
        >
          <LogoMark size={28} />
        </Link>
      </div>
    </section>
  );
}

function HeroComposition() {
  // Munari/Albers-ish composition — nested squares, flat cinnabar on paper.
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <rect x="0" y="0" width="800" height="600" fill="var(--paper)" />
      <rect x="220" y="160" width="280" height="280" fill="var(--cinnabar)" />
      <rect
        x="360"
        y="220"
        width="160"
        height="160"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />
      <rect
        x="420"
        y="260"
        width="60"
        height="60"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function BandReading() {
  return (
    <section
      className="grid-16 bg-paper"
      style={{ paddingBlock: "96px" }}
      aria-label="Основной текст"
    >
      {/* Main column, cols 3-10. */}
      <div className="col-span-full flex flex-col gap-6 xl:col-span-8 xl:col-start-3">
        <p className="text-body text-ink">
          <span
            className="float-left mr-2 text-cinnabar"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "84px",
              lineHeight: "72px",
              paddingTop: "4px",
            }}
          >
            Т
          </span>
          ипографика — это язык, на котором страница говорит с читателем до того,
          как он дочитает первое слово. Интервал, выключка, контраст кеглей —
          всё это грамматика, и её можно учить так же строго, как синтаксис
          русского или JavaScript. В цифровой среде эта грамматика становится
          инструментом: вы не печатаете плакат, а задаёте правила, по которым
          браузер соберёт текст на чужом экране.
        </p>
        <p className="text-body text-ink">
          Хорошая типографика незаметна, как хороший звук в кино: вы понимаете
          сюжет, а не думаете о микрофоне. Плохая — сразу даёт о себе знать:
          слишком плотные строки, шрифт не под кегль, кернинг стреляет в глаза.
          Это ремесло измеряется отсутствием, а не присутствием.
        </p>

        <h2 className="text-caption text-ink" style={{ marginBlock: "24px" }}>
          § 01 · Пропорции
        </h2>

        <p className="text-body text-ink">
          Модульная шкала — это ряд размеров, связанных одним отношением.
          Классическое 1.25 (major third) даёт мягкую иерархию, 1.414 (корень из
          двух) — жёсткую, архитектурную. Выбор шкалы — это выбор интонации:
          вы пишете журнал или составляете спецификацию.
        </p>

        <ExerciseBlock />

        <p className="text-body text-ink">
          Наконец, помните: правила существуют, чтобы их нарушать осознанно.
          Дроп-кап, висячая пунктуация, нестандартный интерлиньяж — всё это
          приёмы, уместные тогда, когда автор понимает, что теряет, решая их
          применить.
        </p>
      </div>

      {/* Margin notes, cols 12-15. */}
      <aside
        className="col-span-full flex flex-col gap-6 xl:col-span-4 xl:col-start-12"
        aria-label="Поля"
      >
        <MarginNote>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            Modular scale
          </span>
          {" — "}
          ряд размеров, построенный на одном соотношении; базовое значение
          обычно 16px.
        </MarginNote>
        <MarginNote>
          Эмиль Рудер,{" "}
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            Typographie
          </span>
          , 1967 — каноничный разворот о вертикальном ритме.
        </MarginNote>
        <MarginNote>
          См. также:{" "}
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            модульная шкала в CSS
          </span>
          {" — "}тема 04 этого раздела.
        </MarginNote>
      </aside>
    </section>
  );
}

function MarginNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        aria-hidden
        className="h-px w-full bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <p
        className="text-ink-muted"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "13px",
          lineHeight: "20px",
        }}
      >
        {children}
      </p>
    </div>
  );
}

function ExerciseBlock() {
  return (
    <figure className="flex flex-col gap-4" style={{ marginBlock: "24px" }}>
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "top" }}
      />
      <p className="text-caption text-ochre">Упражнение</p>
      <div
        className="text-caption text-ink-muted"
        style={{
          height: "192px",
          padding: "16px",
          borderRadius: "2px",
          background: "oklch(0.96 0.01 85)",
        }}
      >
        Интерактивное упражнение здесь
      </div>
      <div
        aria-hidden
        className="h-px w-full bg-ochre"
        style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
      />
    </figure>
  );
}

function BandSynthesis() {
  return (
    <section
      aria-label="Итог"
      className="grid-16 w-full bg-cinnabar text-paper"
      style={{ paddingBlock: "96px" }}
    >
      <div className="col-span-full flex flex-col gap-8 xl:col-span-10 xl:col-start-3">
        <p className="text-caption">Итог</p>
        <h2 className="text-display-m">Что с этим делать</h2>
        <ul className="flex flex-col gap-4" style={{ marginBlock: "16px" }}>
          <li className="text-body-l">
            — Типографика описывается правилами, а не чутьём; чутьё приходит
            потом.
          </li>
          <li className="text-body-l">
            — Модульная шкала — это интонация страницы; выберите её до первого
            макета.
          </li>
          <li className="text-body-l">
            — Хорошая вёрстка незаметна. Измеряйте её отсутствием вопросов, а не
            обилием приёмов.
          </li>
        </ul>
        <p>
          <Link
            href="#"
            className="text-h3 text-paper motion-small hover:underline"
          >
            Следующая тема →
          </Link>
        </p>
      </div>
    </section>
  );
}
