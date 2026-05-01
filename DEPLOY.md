# Deploy — Forma et Functio

Single-page checklist for deploying to **Vercel** with the **free tier** of every dependency. Estimated time: 30 min, $0/mo for low traffic.

If you'd rather pay $19/mo for instant cold starts, jump to [Upgrade path](#upgrade-path).

---

## 1. Vercel project (1 min)

1. Push the repo to GitHub.
2. https://vercel.com → **New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command, output dir, install command — accept defaults; `package.json` already has the right `build` script.
4. **Don't deploy yet** — env vars come next.

## 2. Database — Neon free (3 min)

1. Vercel project → **Storage** → **Connect Database** → **Neon**. Free tier auto-selected.
2. After provisioning, both `DATABASE_URL` (pooled / pgbouncer) and `DIRECT_DATABASE_URL` (unpooled) are auto-injected into Production / Preview / Development scopes.
3. Cold-start note: Neon free auto-suspends compute after 5 min idle. First request after idle is 500-2000 ms. For low-traffic learning sites that's fine; under sustained traffic, see [Upgrade path](#upgrade-path).

## 3. Auth secret + site URL (1 min)

In Vercel **Settings → Environment Variables**:

```
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://<your-vercel-domain>.vercel.app
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>.vercel.app
CRON_SECRET=<openssl rand -hex 32>
```

`NEXT_PUBLIC_SITE_URL` is used for absolute links in emails and the multimodal AI prompt (which embeds reference-example image URLs). Must be the canonical domain, not a preview URL.

## 4. Image uploads — Vercel Blob (2 min, optional)

If you want students to attach screenshots:

1. Vercel project → **Storage** → **Create Blob Store**.
2. `BLOB_READ_WRITE_TOKEN` is auto-injected.

Without it, the upload route returns 503 and the form gracefully says "uploads not configured" instead of crashing.

## 5. AI grading — OpenRouter (5 min, optional)

Sign up at https://openrouter.ai, add credit ($5 lasts a while at default model — gemini-flash). Add:

```
OPENROUTER_API_KEY=sk-or-...
```

Without it, both `/api/chat` and `/api/submissions` fall back to **mock responses** (logged, not real). Daily caps (50 chat / 10 submission per user/day) are enforced regardless — see `src/lib/ai/usage.ts`.

## 6. Email — Resend free (3 min, optional)

Free tier: 3000 emails/month, 100/day. Plenty for streak nudges.

1. Sign up at https://resend.com, verify a sending domain (or skip for smoke test and use `onboarding@resend.dev` as `EMAIL_FROM`).
2. Add:

```
RESEND_API_KEY=re_...
EMAIL_FROM="Forma et Functio <noreply@your-verified-domain.com>"
```

Without it, `sendEmail()` logs `[email:mock] would send to ...` and the cron jobs run without actually sending. Useful for dev.

## 7. Analytics — Plausible (optional)

If you have a Plausible account (or self-host), add:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.vercel.app
NEXT_PUBLIC_PLAUSIBLE_HOST=https://plausible.io   # optional, for self-host
```

Leave both empty to skip — no third-party request happens.

For self-hosted Plausible, also add the host to `next.config.ts` CSP `script-src` and re-deploy.

## 8. First deploy (1 min)

1. Vercel → **Deployments** → **Redeploy** (or just push to `main`).
2. The build runs `prisma migrate deploy && next build`. First time creates all tables; subsequent deploys diff and apply only new migrations.
3. Wait ~2 min for build, then open the URL.

## 9. Smoke test (5 min)

In order, verify:

- [ ] Home loads, four track rows visible
- [ ] `/lessons/foundations` loads, lesson list renders
- [ ] `/lessons/foundations/typography/01-anatomy` loads with drop cap and quiz blocks
- [ ] Sign up at `/register` (creates User row)
- [ ] `/onboarding` → pick a track and level
- [ ] Open a topic, click "Отметить пройденным" → header gains streak badge
- [ ] If Blob configured: submit a work with screenshot via SubmissionForm; if AI configured wait 10-30 s for AI grade to appear
- [ ] `/profile` shows your streak + completed count
- [ ] `/admin/*` only accessible to ADMIN role users — promote yourself with `pnpm run make-admin <email>` from local with prod `DATABASE_URL`

## 10. Cron jobs

Three cron jobs are declared in `vercel.json`:

| Path | Schedule (UTC) | What |
|---|---|---|
| `/api/cron/retry-submissions` | every 6 h | Re-runs FAILED submission grades |
| `/api/cron/streak-digest` | daily 18:00 | Email at-risk streak users |
| `/api/cron/weekly-digest` | Sunday 09:00 | Weekly summary email |

Vercel auto-injects `Authorization: Bearer ${CRON_SECRET}` — `verifyCronAuth` accepts both that and a manual `x-cron-secret` header (so you can also trigger from external schedulers like cron-job.org if needed).

Verify in Vercel → **Cron Jobs** tab after first deploy.

---

## Upgrade path

When you actually need to spend money:

| Pain | Cost | Fix |
|---|---|---|
| Cold-start hurts users | $19/mo | Neon **Launch tier** — no auto-suspend |
| AI cap hits often | ~$5-50/mo | Raise `DAILY_CAPS` in `src/lib/ai/usage.ts`; OpenRouter scales pay-as-you-go |
| Blob storage > 1 GB | $0.15/GB-mo | Vercel Blob auto-bills above free tier |
| Real Plausible | $9/mo | Plausible Cloud |
| Resend > 3000/mo | $20/mo for 50k | Resend Pro |

Total for "comfortable" production: **$28-50/mo** (Neon Launch + Plausible + light AI usage). Keep deferring until you have signal.

---

## Troubleshooting

**Build fails with "P3009: migrations table is in a failed state"** — connect via `psql` to `DIRECT_DATABASE_URL`, run `DELETE FROM "_prisma_migrations" WHERE finished_at IS NULL;`, redeploy.

**Cron returns 401** — verify `CRON_SECRET` is set in the **Production** scope (not just Preview). Vercel Cron only fires against Production deployments.

**Auth says "Invalid CSRF token"** — `NEXTAUTH_URL` must match the canonical domain. Vercel preview URLs have a different origin; auth flows there will fail.

**Image upload returns 503** — `BLOB_READ_WRITE_TOKEN` not set. Check **Storage** tab — the token is connected per-project, not per-environment.
