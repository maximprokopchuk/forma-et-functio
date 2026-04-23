#!/usr/bin/env tsx
/**
 * Content validator — walks content/lessons/<locale>/<track>/<lesson>/
 * and asserts:
 *   - every .mdx has valid frontmatter (Zod)
 *   - topic `order` is unique within a lesson
 *   - topic slugs are unique within a lesson
 *   - `requires` entries resolve to existing topics
 *
 * Exits non-zero on any failure so CI can gate merges.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  lessonIndexSchema,
  topicSchema,
} from "../src/lib/validators/content";

const LOCALE = "ru";
const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons", LOCALE);
const TRACKS = ["foundations", "interface", "experience", "craft"] as const;

type IssueLevel = "ok" | "error";

type Issue = {
  level: IssueLevel;
  file: string;
  messages: string[];
};

const results: Issue[] = [];

function formatIssues(e: z.ZodError): string[] {
  return e.issues.map(
    (issue) => `  - ${issue.path.join(".") || "<root>"}: ${issue.message}`,
  );
}

function readFrontmatter(filePath: string): Record<string, unknown> | null {
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw).data as Record<string, unknown>;
}

function relPath(p: string): string {
  return path.relative(process.cwd(), p);
}

function validateLessonIndex(filePath: string): boolean {
  const data = readFrontmatter(filePath);
  if (!data) {
    results.push({
      level: "error",
      file: relPath(filePath),
      messages: ["Missing or unreadable file"],
    });
    return false;
  }
  const parsed = lessonIndexSchema.safeParse(data);
  if (!parsed.success) {
    results.push({
      level: "error",
      file: relPath(filePath),
      messages: formatIssues(parsed.error),
    });
    return false;
  }
  results.push({ level: "ok", file: relPath(filePath), messages: [] });
  return true;
}

type TopicInfo = {
  file: string;
  slug: string;
  order: number;
  requires: string[];
  lessonSlug: string;
  trackSlug: string;
};

function validateTopic(
  filePath: string,
  trackSlug: string,
  lessonSlug: string,
): TopicInfo | null {
  const data = readFrontmatter(filePath);
  if (!data) {
    results.push({
      level: "error",
      file: relPath(filePath),
      messages: ["Missing or unreadable file"],
    });
    return null;
  }
  const parsed = topicSchema.safeParse(data);
  if (!parsed.success) {
    results.push({
      level: "error",
      file: relPath(filePath),
      messages: formatIssues(parsed.error),
    });
    return null;
  }
  const slug = path
    .basename(filePath)
    .replace(/\.mdx?$/i, "");
  results.push({ level: "ok", file: relPath(filePath), messages: [] });
  return {
    file: relPath(filePath),
    slug,
    order: parsed.data.order,
    requires: parsed.data.requires,
    lessonSlug,
    trackSlug,
  };
}

function checkUniqueness(topics: TopicInfo[]): void {
  const byLesson = new Map<string, TopicInfo[]>();
  for (const t of topics) {
    const key = `${t.trackSlug}/${t.lessonSlug}`;
    if (!byLesson.has(key)) byLesson.set(key, []);
    byLesson.get(key)!.push(t);
  }

  for (const [key, group] of byLesson) {
    const orderCounts = new Map<number, string[]>();
    const slugCounts = new Map<string, string[]>();
    for (const t of group) {
      if (!orderCounts.has(t.order)) orderCounts.set(t.order, []);
      orderCounts.get(t.order)!.push(t.file);
      if (!slugCounts.has(t.slug)) slugCounts.set(t.slug, []);
      slugCounts.get(t.slug)!.push(t.file);
    }
    for (const [order, files] of orderCounts) {
      if (files.length > 1) {
        results.push({
          level: "error",
          file: key,
          messages: [`Duplicate topic order ${order} in files: ${files.join(", ")}`],
        });
      }
    }
    for (const [slug, files] of slugCounts) {
      if (files.length > 1) {
        results.push({
          level: "error",
          file: key,
          messages: [`Duplicate topic slug '${slug}' in files: ${files.join(", ")}`],
        });
      }
    }
  }
}

function checkRequires(topics: TopicInfo[]): void {
  // Keys look like "foundations/typography/01-anatomy"
  const existing = new Set(
    topics.map((t) => `${t.trackSlug}/${t.lessonSlug}/${t.slug}`),
  );
  // Also allow lesson-only references like "foundations/typography"
  const lessonKeys = new Set(
    topics.map((t) => `${t.trackSlug}/${t.lessonSlug}`),
  );
  for (const t of topics) {
    for (const req of t.requires) {
      if (!existing.has(req) && !lessonKeys.has(req)) {
        results.push({
          level: "error",
          file: t.file,
          messages: [`Unresolved \`requires\` reference: '${req}'`],
        });
      }
    }
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

function main(): void {
  const topics: TopicInfo[] = [];

  for (const trackSlug of TRACKS) {
    const trackDir = path.join(CONTENT_ROOT, trackSlug);
    for (const lessonEntry of listDir(trackDir)) {
      const lessonDir = path.join(trackDir, lessonEntry);
      if (!isDirectory(lessonDir)) continue;
      const indexPath = path.join(lessonDir, "index.mdx");
      if (fs.existsSync(indexPath)) {
        validateLessonIndex(indexPath);
      } else {
        results.push({
          level: "error",
          file: relPath(lessonDir),
          messages: ["Missing index.mdx"],
        });
      }
      for (const entry of listDir(lessonDir)) {
        if (entry === "index.mdx" || entry === "index.md") continue;
        if (!/\.mdx?$/i.test(entry)) continue;
        const topicPath = path.join(lessonDir, entry);
        const topic = validateTopic(topicPath, trackSlug, lessonEntry);
        if (topic) topics.push(topic);
      }
    }
  }

  checkUniqueness(topics);
  checkRequires(topics);

  const errors = results.filter((r) => r.level === "error");
  for (const r of results) {
    if (r.level === "ok") {
      console.log(`✓ ${r.file}`);
    } else {
      console.log(`✗ ${r.file}`);
      for (const msg of r.messages) console.log(msg);
    }
  }

  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s) found.`);
    process.exit(1);
  } else {
    console.log(
      `\nAll content valid. ${results.length} file(s) checked, ${topics.length} topic(s).`,
    );
  }
}

main();
