/**
 * Cron auth — accepts either Vercel's standard `Authorization: Bearer ${CRON_SECRET}`
 * (auto-injected by Vercel Cron) or our legacy `x-cron-secret` header (used for
 * manual cron triggers from external schedulers like cron-job.org if Vercel Cron
 * is unavailable).
 *
 * Returns true on a valid request, false otherwise. Caller responds with 401.
 */

export function verifyCronAuth(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return true;

  const legacy = req.headers.get("x-cron-secret");
  if (legacy === expected) return true;

  return false;
}
