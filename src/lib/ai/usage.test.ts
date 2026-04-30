import { describe, expect, it, vi, beforeEach } from "vitest";

// vi.mock factories are hoisted above any top-level statements, so anything
// referenced from inside must be hoisted too. vi.hoisted is the documented
// escape hatch for sharing state between the factory and the test body.
const { rows, tableMock } = vi.hoisted(() => {
  type Row = {
    userId: string;
    day: Date;
    promptTokens: number;
    completionTokens: number;
    messages: number;
  };
  const rows = {
    chat: new Map<string, Row>(),
    submission: new Map<string, Row>(),
  };
  const key = (userId: string, day: Date) => `${userId}|${day.toISOString()}`;
  function tableMock(table: "chat" | "submission") {
    const store = rows[table];
    return {
      findUnique: async ({
        where: { userId_day },
      }: {
        where: { userId_day: { userId: string; day: Date } };
      }) => store.get(key(userId_day.userId, userId_day.day)) ?? null,
      upsert: async ({
        where: { userId_day },
        create,
        update,
      }: {
        where: { userId_day: { userId: string; day: Date } };
        create: Row;
        update: {
          promptTokens: { increment: number };
          completionTokens: { increment: number };
          messages: { increment: number };
        };
      }) => {
        const k = key(userId_day.userId, userId_day.day);
        const existing = store.get(k);
        if (existing) {
          existing.promptTokens += update.promptTokens.increment;
          existing.completionTokens += update.completionTokens.increment;
          existing.messages += update.messages.increment;
        } else {
          store.set(k, { ...create });
        }
      },
    };
  }
  return { rows, tableMock };
});

vi.mock("@/lib/db", () => ({
  db: {
    chatUsage: tableMock("chat"),
    submissionUsage: tableMock("submission"),
  },
}));

import { DAILY_CAPS, getUsage, incrementUsage } from "./usage";

const NOW = new Date("2026-04-30T13:00:00Z");
const userId = "user-1";

describe("DAILY_CAPS", () => {
  it("matches plan §11 / §18 quoted numbers", () => {
    expect(DAILY_CAPS.chat).toBe(50);
    expect(DAILY_CAPS.submission).toBe(10);
  });
});

describe("getUsage / incrementUsage — chat", () => {
  beforeEach(() => {
    rows.chat.clear();
  });

  it("starts at zero", async () => {
    const s = await getUsage(userId, "chat", NOW);
    expect(s.used).toBe(0);
    expect(s.cap).toBe(50);
    expect(s.remaining).toBe(50);
    expect(s.exceeded).toBe(false);
  });

  it("increments by one per call regardless of token args", async () => {
    await incrementUsage(userId, "chat", { promptTokens: 100, completionTokens: 200 }, NOW);
    await incrementUsage(userId, "chat", {}, NOW);
    await incrementUsage(userId, "chat", { promptTokens: 50 }, NOW);

    const s = await getUsage(userId, "chat", NOW);
    expect(s.used).toBe(3);
    expect(s.remaining).toBe(47);
  });

  it("flips exceeded at the cap", async () => {
    for (let i = 0; i < 50; i++) {
      await incrementUsage(userId, "chat", {}, NOW);
    }
    const s = await getUsage(userId, "chat", NOW);
    expect(s.used).toBe(50);
    expect(s.exceeded).toBe(true);
    expect(s.remaining).toBe(0);
  });

  it("buckets per UTC day — calls in the next day start fresh", async () => {
    const tomorrow = new Date("2026-05-01T13:00:00Z");
    for (let i = 0; i < 10; i++) {
      await incrementUsage(userId, "chat", {}, NOW);
    }
    expect((await getUsage(userId, "chat", NOW)).used).toBe(10);
    expect((await getUsage(userId, "chat", tomorrow)).used).toBe(0);
  });

  it("isolates per user", async () => {
    await incrementUsage("a", "chat", {}, NOW);
    await incrementUsage("a", "chat", {}, NOW);
    await incrementUsage("b", "chat", {}, NOW);
    expect((await getUsage("a", "chat", NOW)).used).toBe(2);
    expect((await getUsage("b", "chat", NOW)).used).toBe(1);
  });
});

describe("getUsage / incrementUsage — submission", () => {
  beforeEach(() => {
    rows.submission.clear();
  });

  it("uses the smaller cap", async () => {
    expect((await getUsage(userId, "submission", NOW)).cap).toBe(10);
  });

  it("hits the cap at 10", async () => {
    for (let i = 0; i < 10; i++) {
      await incrementUsage(userId, "submission", {}, NOW);
    }
    expect((await getUsage(userId, "submission", NOW)).exceeded).toBe(true);
  });
});
