import { describe, expect, it } from "vitest";
import {
  approxTokenCount,
  buildChatSystemPrompt,
  getTutorPersona,
  trimHistoryToBudget,
} from "./prompts";

describe("getTutorPersona", () => {
  it("returns a distinct identity per track", () => {
    const ids = (["foundations", "interface", "experience", "craft"] as const).map(
      (t) => getTutorPersona(t).identity,
    );
    expect(new Set(ids).size).toBe(4);
  });

  it("each persona has at least 3 reference shelf entries", () => {
    for (const t of ["foundations", "interface", "experience", "craft"] as const) {
      expect(getTutorPersona(t).shelf.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("response shape is non-empty per track", () => {
    for (const t of ["foundations", "interface", "experience", "craft"] as const) {
      expect(getTutorPersona(t).responseShape.length).toBeGreaterThan(20);
    }
  });
});

describe("buildChatSystemPrompt", () => {
  it("includes the persona identity", () => {
    const prompt = buildChatSystemPrompt("foundations");
    expect(prompt).toContain("Базеля");
  });

  it("differs by track", () => {
    const a = buildChatSystemPrompt("foundations");
    const b = buildChatSystemPrompt("interface");
    expect(a).not.toBe(b);
    expect(a).toContain("Bringhurst");
    expect(b).toContain("Material 3");
  });

  it("includes topic title and description when provided", () => {
    const p = buildChatSystemPrompt(
      "interface",
      "Atomic Design",
      "Метафора химии",
    );
    expect(p).toContain("«Atomic Design»");
    expect(p).toContain("Метафора химии");
  });

  it("omits topic line when title missing", () => {
    const p = buildChatSystemPrompt("interface");
    expect(p).not.toContain("Контекст разговора — тема");
  });

  it("preserves editorial-register guardrails for every track", () => {
    for (const t of ["foundations", "interface", "experience", "craft"] as const) {
      const p = buildChatSystemPrompt(t);
      expect(p).toContain("без восклицаний");
      expect(p).toContain("без эмодзи");
      expect(p).toContain("максимум 200 слов");
    }
  });

  it("references the response-shape rule of the matching track", () => {
    expect(buildChatSystemPrompt("craft")).toContain("длительность в ms");
    expect(buildChatSystemPrompt("experience")).toContain("отдели метод");
  });
});

describe("approxTokenCount", () => {
  it("returns 0 for empty", () => {
    expect(approxTokenCount("")).toBe(0);
  });

  it("scales roughly with length", () => {
    const short = approxTokenCount("hi");
    const long = approxTokenCount("hi".repeat(100));
    expect(long).toBeGreaterThan(short);
    expect(long).toBeGreaterThan(50);
  });
});

describe("trimHistoryToBudget", () => {
  it("returns input unchanged when under budget", () => {
    const msgs = [{ content: "a" }, { content: "b" }];
    expect(trimHistoryToBudget(msgs, 1000)).toEqual(msgs);
  });

  it("drops the oldest until under budget", () => {
    const msgs = [
      { content: "a".repeat(300) }, // ≈ 100 tokens
      { content: "b".repeat(300) },
      { content: "c".repeat(30) }, // ≈ 10 tokens
    ];
    const trimmed = trimHistoryToBudget(msgs, 50);
    expect(trimmed.length).toBeLessThan(msgs.length);
    expect(trimmed[trimmed.length - 1]?.content).toMatch(/^c+$/);
  });

  it("always keeps at least the last message even if it exceeds budget", () => {
    const huge = [{ content: "x".repeat(3000) }];
    expect(trimHistoryToBudget(huge, 10).length).toBe(1);
  });

  it("returns empty input untouched", () => {
    expect(trimHistoryToBudget([], 100)).toEqual([]);
  });
});
