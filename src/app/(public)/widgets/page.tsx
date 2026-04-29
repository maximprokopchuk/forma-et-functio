import type { Metadata } from "next";
import { Exercise } from "@/components/mdx/exercise";
import { LazyMount } from "@/components/widgets/lazy";
import {
  A11ySimulator,
  BeforeAfterSlider,
  ColorContrastSandbox,
  HierarchyReorder,
  MotionCurveEditor,
  SpacingTuner,
  TypePairingLab,
} from "@/components/widgets/dynamic";

/**
 * Demo SVGs for BeforeAfterSlider — two stylised "card" mocks at 800×450,
 * one with poor contrast and a ragged type ladder, the other revised. Inline
 * data URIs keep the showcase self-contained until lessons supply real assets.
 */
const BEFORE_DEMO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#cfcdc6"/>
      <rect x="80" y="60" width="640" height="44" fill="#9d9b94"/>
      <rect x="80" y="140" width="520" height="20" fill="#a8a6a0"/>
      <rect x="80" y="172" width="480" height="20" fill="#a8a6a0"/>
      <rect x="80" y="204" width="320" height="20" fill="#a8a6a0"/>
      <rect x="80" y="320" width="180" height="44" fill="#b1afa9"/>
      <text x="100" y="90" font-family="serif" font-size="22" fill="#7d7b75">Заголовок без иерархии</text>
      <text x="100" y="158" font-family="serif" font-size="14" fill="#8d8b85">Текст в одном весе и одном кегле</text>
      <text x="100" y="350" font-family="serif" font-size="14" fill="#8d8b85">Кнопка</text>
    </svg>`,
  );

const AFTER_DEMO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#f4f1ea"/>
      <text x="80" y="100" font-family="serif" font-size="44" fill="#14110f" font-weight="600">Чистая иерархия</text>
      <line x1="80" y1="120" x2="720" y2="120" stroke="#c8c3b8" stroke-width="0.5"/>
      <text x="80" y="170" font-family="serif" font-size="17" fill="#14110f">Body 17 px, leading 28 — спокойное чтение.</text>
      <text x="80" y="200" font-family="serif" font-size="17" fill="#14110f">Контраст ink на paper держится 12:1.</text>
      <rect x="80" y="320" width="180" height="44" fill="#d8412f"/>
      <text x="120" y="350" font-family="sans-serif" font-size="14" fill="#f4f1ea" letter-spacing="0.05em">CTA · акцент</text>
    </svg>`,
  );

export const metadata: Metadata = {
  title: "Виджеты",
  description:
    "Интерактивные упражнения для практики — демо пяти виджетов Forma et Functio.",
  openGraph: {
    title: "Виджеты — Forma et Functio",
    description:
      "Интерактивные упражнения для практики: иерархия, контраст, типографика, пространство, доступность.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Виджеты — Forma et Functio",
    description:
      "Интерактивные упражнения для практики: иерархия, контраст, типографика, пространство, доступность.",
  },
};

/**
 * Widgets showcase — plan §7 + phase-3 deliverable #6.
 * Hosts all five v1 widgets in sequence for QA and demo. Each widget is
 * wrapped in <Exercise> for visual framing and inside <LazyMount> so it
 * only hydrates when scrolled near. Phase-3 didn't wire these into MDX yet;
 * future lessons can import them directly.
 */
export default function WidgetsShowcase() {
  return (
    <article className="bg-paper">
      <section
        className="grid-16"
        style={{ paddingBlock: "96px" }}
        aria-label="Интро"
      >
        <div className="col-span-full flex flex-col gap-6 xl:col-span-11 xl:col-start-3">
          <p className="text-caption text-ink-muted">Демо · фаза 3</p>
          <h1 className="text-display-m text-ink">Виджеты</h1>
          <p
            className="text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "19px",
              lineHeight: "28px",
              maxWidth: "56ch",
            }}
          >
            Интерактивные упражнения для практики. Каждый виджет — это
            компактный тренажёр принципа: иерархия, контраст, типографика,
            пространство, доступность. Тренируйтесь прямо в браузере.
          </p>
        </div>
      </section>

      <section
        className="grid-16"
        style={{ paddingBottom: "96px" }}
        aria-label="Список виджетов"
      >
        <div
          className="col-span-full flex flex-col xl:col-span-11 xl:col-start-3"
          style={{ gap: "96px" }}
        >
          <LazyMount>
            <Exercise title="Иерархия и порядок чтения">
              <HierarchyReorder
                items={[
                  { id: "eyebrow", label: "СВЕЖИЙ МАТЕРИАЛ" },
                  { id: "h1", label: "Как устроена вёрстка книги" },
                  { id: "body", label: "Короткое предложение о статье, 1-2 строки." },
                  { id: "cta", label: "Читать материал" },
                  { id: "caption", label: "15 мин · Анна Петрова" },
                ]}
                solution={["eyebrow", "h1", "body", "cta", "caption"]}
                hint="Подумай об F-паттерне. Бровь — опознаёт тип. Заголовок — главное. Тело — контекст."
              />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="Контраст цвета">
              <ColorContrastSandbox />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="Пара шрифтов">
              <TypePairingLab />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="Пространство и ритм">
              <SpacingTuner />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="Симулятор доступности">
              <A11ySimulator />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="Редактор кривой движения">
              <MotionCurveEditor />
            </Exercise>
          </LazyMount>

          <LazyMount>
            <Exercise title="До и после редизайна">
              <BeforeAfterSlider
                beforeSrc={BEFORE_DEMO}
                afterSrc={AFTER_DEMO}
                beforeLabel="до"
                afterLabel="после"
                alt="Карточка курса до и после редизайна с акцентной типографикой"
                aspectRatio={16 / 9}
                annotations={[
                  { x: 25, y: 22, side: "after", label: "Заголовок поднят до display-m, серифный воздух" },
                  { x: 75, y: 78, side: "after", label: "CTA в киновари — единственный акцент" },
                ]}
              />
            </Exercise>
          </LazyMount>
        </div>
      </section>
    </article>
  );
}
