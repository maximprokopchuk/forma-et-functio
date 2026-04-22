/**
 * Simple in-memory sliding window rate limiter.
 * Good for single-process / development. For production with multiple
 * instances, replace with Upstash Redis rate limiter.
 */

const store = new Map<string, number[]>();

type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterMs: number };

/**
 * @param key      Unique key per client (e.g. IP + endpoint)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    store.set(key, timestamps);
    return { success: false, retryAfterMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  // Cleanup: remove stale keys every ~1000 requests to prevent memory leak
  if (Math.random() < 0.001) {
    for (const [k, ts] of store.entries()) {
      if (ts.every((t) => t <= windowStart)) store.delete(k);
    }
  }

  return { success: true };
}
