import { TrackList } from "@/components/lessons/track-list";

export const metadata = { title: "Уроки — Forma et Functio" };

export default function LessonsIndexPage() {
  return (
    <section
      className="grid-16 bg-paper"
      style={{ paddingBlock: "96px" }}
      aria-label="Все треки"
    >
      <header className="col-span-full mb-12 xl:col-span-10 xl:col-start-3">
        <h1 className="text-display-l text-ink">Уроки</h1>
        <p
          className="mt-4 text-body-l text-ink-muted"
          style={{ maxWidth: "56ch" }}
        >
          Четыре трека — основа, интерфейсы, опыт и ремесло. Выберите тот,
          с которого хотите начать.
        </p>
      </header>
      <div className="col-span-full">
        <TrackList />
      </div>
    </section>
  );
}
