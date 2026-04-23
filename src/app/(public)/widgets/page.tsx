import type { Metadata } from "next";
import { Exercise } from "@/components/mdx/exercise";
import { LazyMount } from "@/components/widgets/lazy";
import {
  A11ySimulator,
  ColorContrastSandbox,
  HierarchyReorder,
  SpacingTuner,
  TypePairingLab,
} from "@/components/widgets/dynamic";

export const metadata: Metadata = {
  title: "Виджеты",
  description:
    "Интерактивные упражнения для практики — демо пяти виджетов Forma et Functio.",
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
        </div>
      </section>
    </article>
  );
}
