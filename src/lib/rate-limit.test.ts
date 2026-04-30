import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit — sliding window", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to `limit` calls within window", () => {
    for (let i = 0; i < 3; i++) {
      const r = rateLimit("a", 3, 1000);
      expect(r.success).toBe(true);
    }
  });

  it("rejects the (limit+1)th call inside window", () => {
    for (let i = 0; i < 3; i++) rateLimit("b", 3, 1000);
    const r = rateLimit("b", 3, 1000);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.retryAfterMs).toBeGreaterThan(0);
      expect(r.retryAfterMs).toBeLessThanOrEqual(1000);
    }
  });

  it("recovers after window slides past oldest call", () => {
    for (let i = 0; i < 3; i++) rateLimit("c", 3, 1000);
    expect(rateLimit("c", 3, 1000).success).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit("c", 3, 1000).success).toBe(true);
  });

  it("isolates keys", () => {
    for (let i = 0; i < 3; i++) rateLimit("d", 3, 1000);
    expect(rateLimit("d", 3, 1000).success).toBe(false);
    // Different key, untouched bucket.
    expect(rateLimit("d-other", 3, 1000).success).toBe(true);
  });

  it("retryAfterMs decreases as time passes", () => {
    for (let i = 0; i < 3; i++) rateLimit("e", 3, 1000);
    const first = rateLimit("e", 3, 1000);
    vi.advanceTimersByTime(400);
    const later = rateLimit("e", 3, 1000);
    if (!first.success && !later.success) {
      expect(later.retryAfterMs).toBeLessThan(first.retryAfterMs);
    }
  });
});
