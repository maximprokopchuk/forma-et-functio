import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth-guard";
import { getAllTracks } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Контент — Админ-панель" };

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");

/**
 * Count topic files in a given lesson directory for a locale.
 * Counts .mdx / .md files minus the lesson index file.
 * Returns 0 if the directory doesn't exist.
 */
function countTopicsForLocale(
  locale: string,
  trackSlug: string,
  lessonSlug: string,
): number {
  const dir = path.join(CONTENT_ROOT, locale, trackSlug, lessonSlug);
  try {
    if (!fs.existsSync(dir)) return 0;
    return fs
      .readdirSync(dir)
      .filter(
        (f) =>
          /\.mdx?$/i.test(f) && f !== "index.mdx" && f !== "index.md",
      ).length;
  } catch {
    return 0;
  }
}

/**
 * Translation parity dashboard — read-only reporting view.
 *
 * For each lesson we list the RU topic count (source of truth) and the EN
 * topic count on disk. Parity column:
 *  - "полная" if EN count matches RU count and both > 0
 *  - "нет перевода" if EN count is 0
 *  - "X / Y" otherwise
 *
 * Since EN content doesn't exist yet, expect all rows to render as
 * "нет перевода". That's the expected state — this page's job is to
 * surface the gap once authors start filling it in.
 */
export default async function AdminContentPage() {
  await requireAdmin();

  const tracks = getAllTracks();

  // Build a flat listing for the table.
  const entries: Array<{
    trackSlug: string;
    trackTitle: string;
    lessonSlug: string;
    lessonTitle: string;
    ruTopics: number;
    enTopics: number;
  }> = [];

  for (const track of tracks) {
    for (const lesson of track.lessons) {
      entries.push({
        trackSlug: track.slug,
        trackTitle: track.title,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        ruTopics: lesson.topics.length,
        enTopics: countTopicsForLocale("en", track.slug, lesson.slug),
      });
    }
  }

  const totalRu = entries.reduce((s, e) => s + e.ruTopics, 0);
  const totalEn = entries.reduce((s, e) => s + e.enTopics, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1 text-ink">Контент</h1>
        <p className="mt-2 text-body-s text-ink-muted">
          Паритет переводов по урокам. Всего RU-тем: {totalRu}. EN-тем: {totalEn}.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="py-16 text-center text-body-s text-ink-muted">
          Опубликованных уроков нет.
        </p>
      ) : (
        <div className="relative w-full overflow-x-auto border-t border-rule">
          <table className="w-full border-collapse text-body-s">
            <thead>
              <tr className="border-b border-rule">
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Трек</th>
                <th className="py-3 pr-4 text-left text-caption text-ink-muted">Урок</th>
                <th className="w-20 py-3 pr-4 text-right text-caption text-ink-muted">RU</th>
                <th className="w-20 py-3 pr-4 text-right text-caption text-ink-muted">EN</th>
                <th className="w-40 py-3 pl-4 text-right text-caption text-ink-muted">Паритет</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                let parityLabel: string;
                let parityClass: string;
                if (e.enTopics === 0) {
                  parityLabel = "нет перевода";
                  parityClass = "text-ink-muted";
                } else if (e.enTopics === e.ruTopics && e.ruTopics > 0) {
                  parityLabel = "полная";
                  parityClass = "text-lapis";
                } else {
                  parityLabel = `${e.enTopics} / ${e.ruTopics}`;
                  parityClass = "text-cinnabar";
                }
                return (
                  <tr
                    key={`${e.trackSlug}:${e.lessonSlug}`}
                    className="border-b border-rule"
                  >
                    <td className="py-3 pr-4 text-caption text-ink-muted uppercase">
                      {e.trackSlug}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {e.lessonTitle}
                      <span className="ml-2 text-caption text-ink-muted">
                        {e.lessonSlug}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-ink">{e.ruTopics}</td>
                    <td className="py-3 pr-4 text-right text-ink">{e.enTopics}</td>
                    <td className={`py-3 pl-4 text-right text-caption uppercase ${parityClass}`}>
                      {parityLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
