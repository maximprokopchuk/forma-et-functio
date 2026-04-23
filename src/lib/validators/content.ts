import { z } from "zod";

/**
 * Zod schemas for MDX content frontmatter.
 * Mirrors plan §9 — every MDX file loaded through content.ts passes through these.
 * Validation failures throw with the offending file path so authors see the break immediately.
 */

export const bloomsLevelSchema = z.enum(["L1", "L2", "L3", "L4", "L5"]);

export const trackSlugSchema = z.enum([
  "foundations",
  "interface",
  "experience",
  "craft",
]);

export const exerciseTypeSchema = z.enum([
  "knowledge_check",
  "reorder",
  "spot_diff",
  "critique",
  "redesign",
]);

export const lessonIndexSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  level: bloomsLevelSchema.default("L2"),
  order: z.number().int().positive(),
  published: z.boolean().default(true),
});

export const topicSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  estimated_minutes: z.number().int().min(1).max(180),
  blooms_level: bloomsLevelSchema.default("L2"),
  requires: z.array(z.string()).default([]),
  rubric_id: z.string().optional(),
  exercise_types: z.array(exerciseTypeSchema).default([]),
});

export type LessonIndexFrontmatter = z.infer<typeof lessonIndexSchema>;
export type TopicFrontmatter = z.infer<typeof topicSchema>;
export type BloomsLevel = z.infer<typeof bloomsLevelSchema>;
export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
