import { describe, expect, it } from "vitest";
import { nextStreakCount, startOfUTCDay, streakStatus } from "./streak";

const NOW = new Date("2026-04-30T15:30:00Z");

describe("startOfUTCDay", () => {
  it("truncates afternoon to UTC midnight", () => {
    const r = startOfUTCDay(NOW);
    expect(r.toISOString()).toBe("2026-04-30T00:00:00.000Z");
  });

  it("does not shift across local timezones", () => {
    // 23:00 UTC on day X should still resolve to day X, regardless of host TZ.
    const evening = new Date("2026-04-30T23:00:00Z");
    expect(startOfUTCDay(evening).toISOString()).toBe("2026-04-30T00:00:00.000Z");
  });

  it("handles year/month/day boundary", () => {
    const lastSecondOfYear = new Date("2026-12-31T23:59:59Z");
    expect(startOfUTCDay(lastSecondOfYear).toISOString()).toBe(
      "2026-12-31T00:00:00.000Z",
    );
  });
});

describe("streakStatus", () => {
  it("returns 'burned' for null", () => {
    expect(streakStatus(null, NOW)).toBe("burned");
  });

  it("returns 'today' when last day is today", () => {
    expect(streakStatus(new Date("2026-04-30T08:00:00Z"), NOW)).toBe("today");
  });

  it("returns 'today' when last day is later in the same UTC day", () => {
    expect(streakStatus(new Date("2026-04-30T22:00:00Z"), NOW)).toBe("today");
  });

  it("returns 'atRisk' when last day was yesterday UTC", () => {
    expect(streakStatus(new Date("2026-04-29T20:00:00Z"), NOW)).toBe("atRisk");
  });

  it("returns 'burned' when last day was two days ago", () => {
    expect(streakStatus(new Date("2026-04-28T20:00:00Z"), NOW)).toBe("burned");
  });

  it("returns 'burned' for ancient last day", () => {
    expect(streakStatus(new Date("2025-01-01T00:00:00Z"), NOW)).toBe("burned");
  });
});

describe("nextStreakCount", () => {
  it("returns 1 when no prior streak", () => {
    expect(nextStreakCount(0, null, NOW)).toBe(1);
  });

  it("preserves count when same UTC day", () => {
    expect(nextStreakCount(5, new Date("2026-04-30T01:00:00Z"), NOW)).toBe(5);
  });

  it("preserves to 1 when same day but stored count is 0 (defensive)", () => {
    expect(nextStreakCount(0, new Date("2026-04-30T01:00:00Z"), NOW)).toBe(1);
  });

  it("increments by one when last day was yesterday", () => {
    expect(nextStreakCount(7, new Date("2026-04-29T20:00:00Z"), NOW)).toBe(8);
  });

  it("resets to 1 when streak gap is two days", () => {
    expect(nextStreakCount(15, new Date("2026-04-28T20:00:00Z"), NOW)).toBe(1);
  });

  it("resets to 1 when last day is in the future (clock skew defensive)", () => {
    expect(nextStreakCount(15, new Date("2026-05-02T00:00:00Z"), NOW)).toBe(1);
  });
});
