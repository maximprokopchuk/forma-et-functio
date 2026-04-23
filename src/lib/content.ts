import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  lessonIndexSchema,
  topicSchema,
  type BloomsLevel,
  type ExerciseType,
} from "@/lib/validators/content";
import {
  TRACKS,
  TRACK_SLUGS,
  type TrackAccent,
  type TrackSlug,
} from "@/lib/tracks";

/**
 * Content loader — plan §9.
 * Walks content/lessons/ru/<track>/<lesson>/ and returns typed shapes.
 * Frontmatter is validated with Zod; validation failure throws with the file path.
 * Results are cached in production, re-read every call in development.
 */

export type Track = TrackSlug;

export type LessonMeta = {
  slug: string;
  trackSlug: Track;
  title: string;
  description: string;
  level: BloomsLevel;
  order: number;
  published: boolean;
};

export type TopicMeta = {
  slug: string;
  lessonSlug: string;
  trackSlug: Track;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  bloomsLevel: BloomsLevel;
  requires: string[];
  rubricId?: string;
  exerciseTypes: ExerciseType[];
};

export type TopicContent = TopicMeta & {
  content: string; // raw MDX body
};

export type LessonWithTopics = LessonMeta & { topics: TopicMeta[] };

export type TrackWithLessons = {
  slug: Track;
  title: string;
  shortTitle: string;
  description: string;
  manifesto: string;
  colorToken: TrackAccent;
  lessons: LessonWithTopics[];
};

// --- Locale is hardcoded to `ru` for v1; i18n layer arrives later.
const LOCALE = "ru";
const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons", LOCALE);

// --- Module-level cache. Invalidated implicitly by process restart in prod,
//     and forcibly bypassed in dev so authors see edits without a restart.
let cachedTracks: TrackWithLessons[] | null = null;

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function listDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function formatZodError(
  filePath: string,
  error: z.ZodError,
): string {
  const lines = error.issues.map((issue) => {
    const key = issue.path.join(".") || "<root>";
    return `  - ${key}: ${issue.message}`;
  });
  return `Invalid frontmatter in ${filePath}\n${lines.join("\n")}`;
}

function parseLessonIndex(
  filePath: string,
  trackSlug: Track,
  lessonSlug: string,
): LessonMeta | null {
  const raw = readFileSafe(filePath);
  if (!raw) return null;
  const { data } = matter(raw);
  const parsed = lessonIndexSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(formatZodError(filePath, parsed.error));
  }
  return {
    slug: lessonSlug,
    trackSlug,
    title: parsed.data.title,
    description: parsed.data.description,
    level: parsed.data.level,
    order: parsed.data.order,
    published: parsed.data.published,
  };
}

function parseTopicFile(
  filePath: string,
  trackSlug: Track,
  lessonSlug: string,
  topicSlug: string,
): { meta: TopicMeta; body: string } | null {
  const raw = readFileSafe(filePath);
  if (!raw) return null;
  const { data, content } = matter(raw);
  const parsed = topicSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(formatZodError(filePath, parsed.error));
  }
  const meta: TopicMeta = {
    slug: topicSlug,
    lessonSlug,
    trackSlug,
    title: parsed.data.title,
    description: parsed.data.description,
    order: parsed.data.order,
    estimatedMinutes: parsed.data.estimated_minutes,
    bloomsLevel: parsed.data.blooms_level,
    requires: parsed.data.requires,
    rubricId: parsed.data.rubric_id,
    exerciseTypes: parsed.data.exercise_types,
  };
  return { meta, body: content };
}

/**
 * Extract the topic slug from a filename like `01-anatomy.mdx` → `01-anatomy`.
 * Keeps the numeric prefix in the slug — order-in-URL is sometimes useful
 * and the `order` frontmatter field is still the source of truth for sorting.
 */
function topicSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/i, "");
}

function loadLesson(
  trackSlug: Track,
  lessonDir: string,
  lessonSlug: string,
): LessonWithTopics | null {
  const indexPath = path.join(lessonDir, "index.mdx");
  const lessonMeta = parseLessonIndex(indexPath, trackSlug, lessonSlug);
  if (!lessonMeta) return null;

  const entries = listDir(lessonDir);
  const topics: TopicMeta[] = [];
  for (const entry of entries) {
    if (entry === "index.mdx" || entry === "index.md") continue;
    if (!/\.mdx?$/i.test(entry)) continue;
    const topicSlug = topicSlugFromFilename(entry);
    const topicFile = path.join(lessonDir, entry);
    const parsed = parseTopicFile(topicFile, trackSlug, lessonSlug, topicSlug);
    if (parsed) topics.push(parsed.meta);
  }
  topics.sort((a, b) => a.order - b.order);

  return { ...lessonMeta, topics };
}

function loadAllTracks(): TrackWithLessons[] {
  const result: TrackWithLessons[] = [];
  for (const trackSlug of TRACK_SLUGS) {
    const trackConfig = TRACKS[trackSlug];
    const trackDir = path.join(CONTENT_ROOT, trackSlug);
    const lessons: LessonWithTopics[] = [];
    for (const lessonEntry of listDir(trackDir)) {
      const lessonDir = path.join(trackDir, lessonEntry);
      if (!isDirectory(lessonDir)) continue;
      const lesson = loadLesson(trackSlug, lessonDir, lessonEntry);
      if (lesson && lesson.published) lessons.push(lesson);
    }
    lessons.sort((a, b) => a.order - b.order);
    result.push({
      slug: trackSlug,
      title: trackConfig.title,
      shortTitle: trackConfig.shortTitle,
      description: trackConfig.description,
      manifesto: trackConfig.manifesto,
      colorToken: trackConfig.colorToken,
      lessons,
    });
  }
  return result;
}

export function getAllTracks(): TrackWithLessons[] {
  if (isDev() || !cachedTracks) {
    cachedTracks = loadAllTracks();
  }
  return cachedTracks;
}

export function getTrack(trackSlug: string): TrackWithLessons | null {
  return getAllTracks().find((t) => t.slug === trackSlug) ?? null;
}

export function getLesson(
  trackSlug: string,
  lessonSlug: string,
): LessonWithTopics | null {
  const track = getTrack(trackSlug);
  if (!track) return null;
  return track.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

export function getTopic(
  trackSlug: string,
  lessonSlug: string,
  topicSlug: string,
): TopicContent | null {
  if (!TRACK_SLUGS.includes(trackSlug as TrackSlug)) return null;
  const track = trackSlug as TrackSlug;
  const lessonDir = path.join(CONTENT_ROOT, track, lessonSlug);
  if (!isDirectory(lessonDir)) return null;

  // Try both `<slug>.mdx` and `<slug>.md` (mdx is the canonical form).
  const candidates = [
    path.join(lessonDir, `${topicSlug}.mdx`),
    path.join(lessonDir, `${topicSlug}.md`),
  ];
  const file = candidates.find((c) => fs.existsSync(c));
  if (!file) return null;

  const parsed = parseTopicFile(file, track, lessonSlug, topicSlug);
  if (!parsed) return null;
  return { ...parsed.meta, content: parsed.body };
}

/**
 * Total-topic counts used by the homepage "X разделов · Y часов" summary.
 * Hours = sum of estimatedMinutes across all topics / 60, rounded.
 */
export function getTrackStats(trackSlug: string): {
  lessonCount: number;
  topicCount: number;
  hours: number;
} {
  const track = getTrack(trackSlug);
  if (!track) return { lessonCount: 0, topicCount: 0, hours: 0 };
  const minutes = track.lessons
    .flatMap((l) => l.topics)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  return {
    lessonCount: track.lessons.length,
    topicCount: track.lessons.flatMap((l) => l.topics).length,
    hours: Math.max(1, Math.round(minutes / 60)),
  };
}
