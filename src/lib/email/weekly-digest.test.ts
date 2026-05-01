import { describe, expect, it } from "vitest";
import { shouldSendWeekly, type WeeklySummary } from "./weekly-digest";

const empty: WeeklySummary = {
  topicsCompleted: 0,
  submissionsSent: 0,
  reviewsGraded: 0,
  streak: 0,
  streakAlive: false,
  reviewsDue: 0,
};

describe("shouldSendWeekly", () => {
  it("skips dormant users (zero everywhere)", () => {
    expect(shouldSendWeekly(empty)).toBe(false);
  });

  it("sends when at least one topic was completed", () => {
    expect(shouldSendWeekly({ ...empty, topicsCompleted: 1 })).toBe(true);
  });

  it("sends when a submission was sent", () => {
    expect(shouldSendWeekly({ ...empty, submissionsSent: 1 })).toBe(true);
  });

  it("sends when reviews were graded", () => {
    expect(shouldSendWeekly({ ...empty, reviewsGraded: 1 })).toBe(true);
  });

  it("sends when streak is alive even without recent activity", () => {
    expect(shouldSendWeekly({ ...empty, streak: 5, streakAlive: true })).toBe(
      true,
    );
  });

  it("does NOT send if streak count > 0 but streak is burned", () => {
    expect(shouldSendWeekly({ ...empty, streak: 5, streakAlive: false })).toBe(
      false,
    );
  });

  it("sends when there are due reviews even with no activity", () => {
    expect(shouldSendWeekly({ ...empty, reviewsDue: 3 })).toBe(true);
  });

  it("treats every signal independently — no AND coupling", () => {
    expect(shouldSendWeekly({ ...empty, topicsCompleted: 1, reviewsDue: 0 })).toBe(
      true,
    );
    expect(shouldSendWeekly({ ...empty, topicsCompleted: 0, reviewsDue: 1 })).toBe(
      true,
    );
  });
});
