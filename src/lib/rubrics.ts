import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

/**
 * Rubric YAML loader — plan §6.
 * Walks content/rubrics/*.yaml, parses with js-yaml, validates with Zod.
 * Module-level cache keyed by id; invalidated only by process restart (the
 * files are build-time content, not user data).
 */

const rubricDimensionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  weight: z.number().min(0).max(1),
  levels: z.record(z.string(), z.string()),
});

const referenceExampleSchema = z.object({
  url: z.string().min(1),
  score: z.number().min(1).max(5),
  notes: z.string().min(1),
});

const rubricSchema = z.object({
  id: z.string().min(1),
  dimensions: z.array(rubricDimensionSchema).min(1),
  reference_examples: z.array(referenceExampleSchema).optional(),
});

export type RubricDimension = z.infer<typeof rubricDimensionSchema>;
export type ReferenceExample = z.infer<typeof referenceExampleSchema>;
export type Rubric = z.infer<typeof rubricSchema>;

const RUBRICS_ROOT = path.join(process.cwd(), "content", "rubrics");

let cache: Map<string, Rubric> | null = null;

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function loadAll(): Map<string, Rubric> {
  const map = new Map<string, Rubric>();
  if (!fs.existsSync(RUBRICS_ROOT)) return map;

  const entries = fs.readdirSync(RUBRICS_ROOT);
  for (const entry of entries) {
    if (!/\.ya?ml$/i.test(entry)) continue;
    const filePath = path.join(RUBRICS_ROOT, entry);
    const raw = fs.readFileSync(filePath, "utf8");
    let data: unknown;
    try {
      data = yaml.load(raw);
    } catch (err) {
      throw new Error(
        `Failed to parse ${filePath}: ${(err as Error).message}`,
      );
    }
    const parsed = rubricSchema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "<root>"}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid rubric in ${filePath}\n${issues}`);
    }
    map.set(parsed.data.id, parsed.data);
  }
  return map;
}

function ensureCache(): Map<string, Rubric> {
  if (isDev() || !cache) cache = loadAll();
  return cache;
}

export function getRubric(id: string): Rubric | null {
  return ensureCache().get(id) ?? null;
}

export function getAllRubrics(): Rubric[] {
  return Array.from(ensureCache().values());
}
