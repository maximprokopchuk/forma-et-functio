# Frontend / Platform Review — Forma et Functio

**Reviewer:** Principal frontend engineer (ex-Vercel, Next.js core contrib)
**Scope:** Technical architecture critique of `docs/implementation-plan.md` against the `diabolus-in-musica` reference
**Verdict:** Plan is directionally sound but under-engineered in five places that will hurt within 3 months: the "copy-paste src/lib" strategy, the runtime Markdown pipeline, the chat stream failure mode, the undefined content type-safety layer, and a zero-testing baseline. Fix those before writing any lesson content.

---

## 1. Copy-from-reference strategy

The plan's Section 9 lists roughly 15 files to "copy 1:1" from `diabolus-in-musica/src/lib` and `src/app/api/auth`. This is a **trap**. Here is what actually happens:

**Hidden cost #1 — security drift.** `rate-limit.ts` in the reference is an in-memory sliding window (see lines 7–46 of `src/lib/rate-limit.ts`). It is explicitly documented as "not production-safe with multiple instances". The first time diabolus fixes this (Upstash Redis, likely), Forma won't know. Same story when next-auth v4 ships a CVE — and it will; v4 is already in LTS-only mode, v5 (Auth.js) is the forward path.

**Hidden cost #2 — invisible divergence.** `auth.ts` line 83 selects `preferredInstrument` in the JWT callback. You'll change that to `preferredTrack`. Six months later diabolus adds `defaultLanguage` or `emailPreferences` to the JWT; there is no signal that Forma needs the same change. Grep-based audits don't scale past 5 files.

**Hidden cost #3 — shape-shifting types.** `src/lib/content.ts` exports `LessonMeta` with `instrument: string`. You'll rename to `track`. Every downstream consumer (API routes, pages, admin) imports that type. You're now maintaining two parallel type trees that look nearly identical — perfect conditions for a stale-type bug.

**Three viable strategies, ranked:**

1. **Date-stamped clean copy (recommended for v1).** Create `docs/SNAPSHOT.md` recording the exact diabolus commit SHA you copied from (e.g. `d964637`, today). Commit a `diff` of every modified file in `docs/drift/`. Subscribe to diabolus security-label PRs via GitHub. Accept divergence as a design choice, not an accident. This is the right call for a 1-person-on-weekends project.

2. **Shared npm package (`@maksim/lms-core`) published to GitHub Packages.** Extract `rate-limit`, `auth-guard`, `db`, `content` loader (made generic over enum). Cost: ~2 days of packaging + CI. Benefit: one bug fix, two consumers. Only worth it if you plan a third portal. I don't recommend this until you have ≥3 products.

3. **Git subtree (`git subtree add --prefix=src/lib/core diabolus main --squash`).** Technically correct, operationally a nightmare: every merge conflict is yours, pull requests get weird, new contributors have no idea what's happening. Skip.

**Concrete action:** Do option 1. Add a `SNAPSHOT.md` with git SHA of diabolus `main` at the moment you copy, and a `make diff-upstream` script that runs `git diff <sha>..diabolus/main -- src/lib/` so you can eyeball what's changed upstream quarterly.

**Also non-obvious:** The reference has `middleware.ts` inside `src/middleware.ts` (confirmed — `/Users/maksimprokopcuk/repo/diabolus-in-musica/src/middleware.ts`), not the project root. Next.js 16 supports both locations but the proxy-rename migration (middleware → `proxy.ts` in v16 in some setups) is worth checking before copy. Run the `@next/codemod` middleware-to-proxy codemod after copy.

---

## 2. Code playground architecture

The plan waves its hand: "Sandpack or custom". For a **design learning context** (not a JS IDE) the trade-offs are sharper than they look.

**Sandpack (`@codesandbox/sandpack-react@^2.x`)** — first-class React component, Monaco-backed editor, preview iframe, bundler in a web worker.
- Bundle size: **~380 KB gzipped** for `@codesandbox/sandpack-react` + ~1.2 MB for the bundler worker (fetched lazily, cacheable). This is *not trivial*; it will eat your Lighthouse budget if loaded on first paint.
- CSP cost: Sandpack needs `worker-src blob:` and `frame-src https://*.sandpack-static-server.codesandbox.io` (or self-hosted static server). Your `next.config.ts` will need CSP relaxation on playground pages only.
- Offline: works offline once bundler is cached.
- Overkill for static HTML/CSS/JS, because Sandpack's superpower is npm dependency resolution — which you do not need for a typography demo.

**CodeMirror 6 + custom `srcdoc` iframe** — ~80 KB gzipped for `@codemirror/state` + `@codemirror/view` + language packs. You build the preview yourself:

```tsx
// Proof-of-concept, ~50 lines total
const srcDoc = `<style>${css}</style>${html}<script>${js}<\/script>`;
<iframe sandbox="allow-scripts" srcDoc={srcDoc} />
```

This is 4x lighter than Sandpack, gives you full CSP control (`sandbox="allow-scripts"` blocks network/storage/same-origin), and matches the "design learning" use case: students mostly edit HTML+CSS, occasionally a few lines of JS. One-day build.

**Monaco Editor** — **overkill**. 2 MB+ gzipped base, AMD loader weirdness, heavy in React. Only justified for TypeScript with IntelliSense. Skip.

**Recommendation:** CodeMirror 6 + custom iframe for v1. Reach for Sandpack only when a lesson requires `import` resolution (not in your first 40 lessons — Fronted track is CSS-heavy, not React-heavy).

**Persistence of user code:**
- **localStorage** for unauthenticated users, key `playground:<lessonSlug>:<topicSlug>` with a 1 MB quota check. Use `structured-clone` and throttle writes to 500 ms.
- **DB for authenticated users**: add a `PlaygroundSnapshot` model (see Section 4) keyed by `(userId, topicSlug)`, updated via a debounced server action (not an API route — server actions deduplicate better). Save on "save" button AND on blur, not on every keystroke.
- Don't auto-restore across devices without a visible UI cue — "Восстановить последний код?" dialog. Silent restore confuses users.

**Intersection observer lazy-load is non-negotiable:**

```tsx
const Playground = dynamic(() => import("./playground"), { ssr: false });
// Wrap in IntersectionObserver; only mount when 200px from viewport.
```

This alone saves 80 KB on topic pages where the playground is below the fold.

---

## 3. Content pipeline

The reference uses **runtime** Markdown parsing (`src/lib/content.ts` lines 42–111): on first request in a fresh process, it walks `content/lessons/`, parses every frontmatter, caches in module-level `Map`s. In dev this is fine (~100 files, ~300 ms). At 100+ lessons with interactive components, three problems:

1. **Cold start cost on Vercel.** Every new Lambda worker re-reads and parses. With 300 files * 5 KB average + gray-matter + your future MDX compilation, you're looking at **500-900 ms** added to first-request latency per region. Unacceptable on a learning page that should TTFB under 300 ms.
2. **Bundle inclusion.** Because `loadAll` uses `fs.readdirSync(process.cwd() + "/content")`, Next.js doesn't know to bundle the content. On Vercel, it works *by accident* because Vercel's file-tracer (`@vercel/nft`) follows the string path. One rename and content disappears from the deploy.
3. **No interactive components inside Markdown.** The reference uses `react-markdown` with rehype-highlight. You cannot `<Playground />` inside a `.md` file. You'll end up splitting topic pages into "markdown blob + JSX scaffold around it" — messy.

**Three options:**

| Option | Build time | DX | Interactive components | Bundle impact |
|---|---|---|---|---|
| Runtime MD (current) | 0 | simple | no | runtime fs reads |
| **MDX via `@next/mdx`** | +2-4 s | good | yes (native) | compiled to JS |
| **Fumadocs or Contentlayer** | +5-10 s | excellent | yes | tree-shaken |

**Recommendation: MDX + custom remark shortcodes.** Specifically:

- Use `@next/mdx@^16` with `fumadocs-mdx@^12` for the collection/validation layer. Fumadocs is actively maintained (Contentlayer2 is a community fork — acceptable but higher bus-factor risk).
- Keep `content/lessons/<locale>/<track>/<slug>/` structure — Fumadocs supports it out of box via `source.ts`.
- Custom directives via `remark-directive` so you can write `:::figma{url=... title="..."}` and `:::compare{before=... after=...}` without ejecting to JSX. This matters — your content authors are designers, not React devs.
- For embedded React components (`<TypeSpecimen>`, `<Playground>`), expose them through the MDX `components` prop in the topic page.

**i18n content layout — concrete proposal:**

```
content/
  lessons/
    ru/
      ui/
        typography/
          index.md                 # frontmatter: { title, track, level, order, published, translations: ["en"] }
          01-anatomy.md
          02-hierarchy.md
    en/
      ui/
        typography/
          index.md
          01-anatomy.md
```

- `source.ts` (Fumadocs) returns `getLessons({ locale })`.
- `generateStaticParams` in `app/[locale]/lessons/[lesson]/[topic]/page.tsx` iterates both locales.
- **Critical:** `translations` frontmatter field declares which locales exist — no silent 404s when a Russian topic has no English counterpart. Show "Перевод скоро" fallback instead.
- `next-intl@^3` for UI strings (separate from lesson content, stored in `messages/ru.json`).

**Type safety for frontmatter — Zod schema evaluated at load time:**

```ts
const lessonIndexSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  track: z.enum(["GENERAL", "UI", "UX", "PRODUCT", "FRONTEND", "BRAND"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  order: z.number().int().positive(),
  published: z.boolean(),
  translations: z.array(z.enum(["ru", "en"])).optional(),
});
```

Fumadocs generates `.source/` types from this — you get autocomplete and compile-time errors, not runtime blow-ups. The reference's runtime `String(data.title ?? "")` pattern (content.ts line 84) is a bug magnet and should not survive the copy.

---

## 4. Database and schema

The plan lifts `prisma/schema.prisma` mostly verbatim, adding `Submission`. Problems and improvements:

**UserProgress is under-indexed for reports.** Current unique is `(userId, lessonSlug, topicSlug)`. For "completion by track across all users" (admin dashboard), you need to join lesson metadata *from the filesystem* or denormalize. Denormalize:

```prisma
model UserProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonSlug  String
  topicSlug   String
  track       Track    // DENORMALIZED — write on create from lesson frontmatter
  level       Level    // DENORMALIZED — same
  completed   Boolean  @default(false)
  completedAt DateTime?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonSlug, topicSlug])
  @@index([userId, track])           // "my UI progress"
  @@index([track, completed])        // "how many people finished UI lessons"
  @@index([userId, completedAt])     // activity stream
  @@map("user_progress")
}
```

The write-time cost is a single lesson lookup (already in cache); the read-time win is large. Trade-off: track rename requires data migration, but tracks are nearly immutable.

**Submission model — the plan is too thin.** Needed additions:

```prisma
enum SubmissionStatus {
  PENDING          // AI feedback in flight
  FEEDBACK_READY
  FEEDBACK_FAILED  // retry-able
  ARCHIVED
}

model Submission {
  id           String           @id @default(cuid())
  userId       String
  topicSlug    String
  lessonSlug   String
  figmaUrl     String?
  imageUrl     String?          // Vercel Blob URL, not base64
  description  String           @db.Text
  feedback     String?          @db.Text
  status       SubmissionStatus @default(PENDING)
  feedbackModel String?         // audit: which model ran
  feedbackTokens Int?           // cost tracking
  retryCount   Int              @default(0)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([status, createdAt])   // for the retry worker
  @@map("submissions")
}
```

AI feedback flow: **do not run feedback inside the submission POST handler.** Use a Vercel Workflow (WDK) or a simple `/api/submissions/[id]/feedback` endpoint triggered by a queue. Persist `status=PENDING`, return immediately, stream feedback to the client via SSE while the worker writes. On failure, `FEEDBACK_FAILED` with incrementing `retryCount`; cron sweep retries up to 3.

**Indexes that should exist on day one:**

```prisma
// ChatMessage — add partial index for "last N messages per topic"
@@index([userId, lessonSlug, topicSlug, createdAt(sort: Desc)])

// ErrorReport — the reference is unindexed
@@index([resolved, createdAt])   // admin sorted list
@@index([lessonSlug])             // "all reports for this lesson"

// Session (next-auth) — already indexed on sessionToken; add:
@@index([expires])                // cleanup sweeps
```

**Migration strategy lesson from the reference.** The reference previously had `Lesson` and `Topic` Prisma models that were removed (git history shows the refactor to file-based content). The failure mode: DB and filesystem can disagree (orphaned `ChatMessage.lessonSlug` pointing to a deleted lesson). Prevention:

1. **Never delete a `.md` file** — mark `published: false` in frontmatter. Content validator CI blocks deletion PRs that leave referenced slugs.
2. **Referential integrity check in `validate-content.ts`:** for every distinct `lessonSlug` in `UserProgress` / `ChatMessage` / `Submission`, assert a matching filesystem entry exists. Run in CI nightly against production DB (read-only replica).
3. **Soft-delete with a `legacy_slugs` table** if you must rename. Map old → new slugs and rewrite references.

Migrations: use `prisma migrate` (the reference uses `db:push` which is fine for solo dev but loses history). Commit `.sql` migrations from day one.

---

## 5. AI chat architecture — the stream-failure bug

Reading `src/app/api/chat/route.ts` lines 69–124, the bug is in plain sight:

```ts
// Line 69: user message saved to DB FIRST, unconditionally
await db.chatMessage.create({ data: { ..., role: "user", content: message } });

// Line 90: stream started
const stream = await chatStream(messages);

// Line 95-124: inside ReadableStream.start, assistant message only saved
// after the for-await completes successfully.
```

**Failure modes:**
- Upstream 500 / timeout → user message persisted, no assistant message. Next GET (line 35) returns a dangling user turn. On the next POST, it becomes part of `history` and confuses the model.
- Client disconnects mid-stream → `controller.error()` fires, but the partial `fullResponse` is thrown away. User paid OpenRouter tokens for nothing.
- Slow hand-off → two concurrent POSTs interleave writes.

**Concrete fix — three parts:**

### (a) Save both rows in a single transaction, `pending` state for assistant

```ts
const [userMsg, assistantMsg] = await db.$transaction([
  db.chatMessage.create({ data: { ..., role: "user", content: message } }),
  db.chatMessage.create({ data: { ..., role: "assistant", content: "", status: "PENDING" } }),
]);
```

Add a `status` column to `ChatMessage`:

```prisma
enum ChatMessageStatus { PENDING STREAMING COMPLETE FAILED }
status ChatMessageStatus @default(COMPLETE)
```

The GET filter excludes `PENDING | FAILED` so dangling turns don't leak to the client. A background sweep deletes orphaned PENDING rows older than 2 minutes.

### (b) Flush partial content on client disconnect

```ts
const readableStream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of stream) { /* ... accumulate */ }
      await db.chatMessage.update({
        where: { id: assistantMsg.id },
        data: { content: fullResponse, status: "COMPLETE" },
      });
      controller.close();
    } catch (error) {
      await db.chatMessage.update({
        where: { id: assistantMsg.id },
        data: { content: fullResponse, status: fullResponse ? "COMPLETE" : "FAILED" },
      });
      controller.error(error);
    }
  },
  async cancel() {
    // Client disconnected — persist whatever we have
    await db.chatMessage.update({
      where: { id: assistantMsg.id },
      data: { content: fullResponse, status: fullResponse ? "COMPLETE" : "FAILED" },
    });
  },
});
```

### (c) Switch to the Vercel AI SDK

The reference uses raw `openai` SDK + hand-rolled SSE. The AI SDK v5 (`ai@^5`) handles streaming + abort + tool-calling properly, cuts ~80 lines, and gives you `useChat` on the client for free. Migration is 2 hours and removes a class of bugs.

**Other chat concerns:**

- **Per-user rate limiting is missing.** The reference rate-limits `login:<email>` only (auth.ts line 39). Chat endpoint has no limiter. Add:

```ts
const key = `chat:${session.user.id}`;
const rl = rateLimit(key, 20, 60_000); // 20 msg/min
if (!rl.success) return NextResponse.json({ error: "Слишком часто" }, { status: 429 });
```

Per-IP too (separate key) to catch enumeration. Move rate-limit backend to Upstash Redis before launch — in-memory breaks across Vercel regions.

- **Context window management.** Line 67 takes `take: 20` — naive. At ~300 tokens average per message + 4 KB system prompt + full topic content injected (can be 3000 words = 4500 tokens), you can blow past 8k context on `gemini-flash-1.5`. Use a token counter (`tiktoken` or `@anthropic-ai/tokenizer`) and trim oldest messages until total ≤ 75% of model context. Alternative: summarize every N messages into a "running context" string.

- **Per-track system prompts.** `buildChatSystemPrompt` (ai/prompts.ts line 7) hardcodes "преподаватель теории музыки". For Forma, vary by track:

```ts
const tutorPersona: Record<Track, string> = {
  UI: "UI-дизайнер с 10-летним опытом, ментор в дизайн-системах",
  UX: "UX-исследователь, знаток HCI и юзабилити",
  FRONTEND: "фронтенд-инженер, специализирующийся на CSS и доступности",
  BRAND: "арт-директор, эксперт по типографике и айдентике",
  PRODUCT: "продуктовый дизайнер, знаток дискавери и метрик",
  GENERAL: "преподаватель дизайна",
};
```

- **Cost control.** Set hard ceilings:
  - `max_tokens: 800` for chat (reference uses 2048 — excessive for a learning chatbot turn).
  - Daily per-user budget: track `chatMessage` count/day in a Redis counter, cap at 100. Over budget → friendly "подожди до завтра" message.
  - Model tiering: `gemini-flash-1.5` for chat (current, fine), `claude-sonnet-4` ONLY for `Submission` AI feedback (higher value, less frequent).
  - Log `prompt_tokens` + `completion_tokens` returned by OpenRouter into a `ChatUsage` table for weekly cost reports.

---

## 6. Performance budget — concrete numbers

**Lighthouse CI (`@lhci/cli@^0.15`) gating PRs:**

| Metric | Home | Track page | Topic page | Admin |
|---|---|---|---|---|
| Performance | ≥ 95 | ≥ 92 | ≥ 88 | ≥ 80 |
| Accessibility | ≥ 98 | ≥ 98 | ≥ 98 | ≥ 95 |
| Best Practices | ≥ 95 | ≥ 95 | ≥ 95 | ≥ 90 |
| SEO | ≥ 95 | ≥ 95 | ≥ 95 | n/a |
| FCP | ≤ 1.2 s | ≤ 1.5 s | ≤ 1.8 s | ≤ 2 s |
| LCP | ≤ 2.0 s | ≤ 2.2 s | ≤ 2.5 s | ≤ 3 s |
| CLS | ≤ 0.05 | ≤ 0.05 | ≤ 0.1 | ≤ 0.1 |
| INP | ≤ 200 ms | ≤ 200 ms | ≤ 200 ms | ≤ 300 ms |

Run on emulated Moto G4 over 4G (Lighthouse default). Fail the PR, don't just warn. The plan's "Lighthouse 90+" in Section 10 is too loose — 90 on accessibility for a design school is embarrassing.

**Bundle size ceilings (gzipped, per route):**

- `/` (home): ≤ 90 KB JS initial
- `/lessons` (track list): ≤ 100 KB
- `/lessons/[track]/[lesson]/[topic]` (topic page w/o playground): ≤ 140 KB
- `/lessons/[track]/[lesson]/[topic]` (with playground chunk loaded): ≤ 240 KB
- Admin: no ceiling (authed, low traffic)

Enforce via `size-limit@^11` in CI, checking `.next/static/chunks/**`. Example config:

```json
{ "path": ".next/server/app/lessons/**/page.js", "limit": "140 KB" }
```

**Heavy offenders to manage:**

- **Sandpack/CodeMirror**: never in the main bundle. `dynamic(..., { ssr: false })` + `loading="lazy"` on the iframe + IntersectionObserver trigger 200 px below viewport.
- **Figma embeds**: `<iframe loading="lazy">` + a placeholder (static thumbnail) until intersection. Figma's embed script is 800 KB+ uncached; don't hit it on every topic page render.
- **`react-markdown` + rehype-highlight**: ~70 KB. If you keep MDX instead, this disappears (MDX compiles to JSX at build time, zero runtime parser).
- **OpenGraph image gen (`opengraph-image.tsx`)**: `next/og` is heavy when used in regular routes; keep it route-segmented and use `runtime = "edge"` for the OG route.

**Strategy:** Route-level code splitting by default (App Router does this). Verify via `next build --analyze`. If a topic page includes playground + Figma + color picker, the sum must still fit 240 KB gzipped — pick two per page.

---

## 7. Accessibility — the design-school test

A design education portal that fails WCAG is a reputational extinction event. Bar must be **WCAG 2.2 AA, measurable in CI**.

**CI gating:**

1. **`@axe-core/playwright@^4`** in e2e tests. Run axe on every route, fail on any violation of severity `critical` or `serious`.

```ts
// tests/a11y.spec.ts
test('topic page is axe-clean', async ({ page }) => {
  await page.goto('/lessons/ui/typography/anatomy');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['critical','serious'].includes(v.impact))).toEqual([]);
});
```

2. **Pa11y-CI** in nightly runs against preview deploys — catches dynamic issues axe misses (focus order after dialog open).

3. **Storybook addon-a11y** on every component story. Fail the Chromatic/visual-review on a11y regressions.

**Keyboard navigation spec for interactive widgets:**

- **Color picker**: arrow keys nudge HSL (step 1, shift+arrow step 10); `tab` advances between H/S/L; `enter` copies value. Document in an ARIA label.
- **Type specimen**: range slider is native `<input type="range">` with `aria-valuetext="16 пикселей"` (not just `aria-valuenow=16`).
- **Playground**: CodeMirror has solid keyboard support; trap-escape required so `tab` inside editor inserts a tab character but users can still escape with `Esc` then `tab`. Document shortcut in a visible hint.
- **Before/after comparison slider**: ArrowLeft/Right moves the divider in 5% increments; `role="slider"` with `aria-valuemin=0 aria-valuemax=100 aria-valuenow=...`.
- **Figma embed**: wrap in `<figure>` with `<figcaption>`, add `title` on the iframe. Provide a "скачать в PDF" fallback for screen-reader users — you cannot make a Figma iframe accessible from outside.

**Screen reader support for visual content:**

- **Alt text discipline**: lint rule `jsx-a11y/alt-text` in ESLint. For MDX images, require `alt` in every `![...](...)` — custom remark plugin fails the build on empty alt.
- **Decorative vs meaningful**: `alt=""` allowed only if image is marked `role="presentation"` and the surrounding caption conveys meaning. Write an MDX component `<Figure src alt caption />` that enforces both.
- **ARIA landmarks**: `<header>`, `<nav>`, `<main>`, `<aside>` (for the interactive side panel), `<footer>`. Skip-to-content link in `layout.tsx`.
- **Live regions**: chat assistant responses stream into `<div aria-live="polite">`; progress saves announce via `<div aria-live="polite" role="status">`.

**Color contrast in light AND dark modes — preventing the reference's bug:**

The reference had a "critical dark-mode CSS bug" per the prompt. Likely cause: `hsl(var(--foreground))` on a background that was itself variable, and the dark override forgot one pair. Prevention:

1. **Design tokens in OKLCH**, not HSL — perceptually uniform, makes contrast math easier.
2. **Automated contrast audit** — `@adobe/leonardo-contrast-colors` CLI script in CI, loads `globals.css` tokens, asserts every `--foreground-*` vs `--background-*` pair is ≥ 4.5:1 (body) / 3:1 (large text) in **both** light and dark.
3. **Playwright visual regression** — screenshot every route in both themes; any unexpected diff blocks PR.
4. **`color-contrast()` CSS function** (Chrome 108+, `@supports`) for the rare dynamic case.

Don't trust "we'll eyeball it". The reference's bug proves eyeballs fail.

---

## 8. Testing strategy — the reference has zero

The reference has no tests. For a paid-audience learning platform this cannot continue. **ROI-ranked stack:**

| Tool | Version | What it tests | ROI |
|---|---|---|---|
| **Vitest** | `^2` | Pure functions (content loader, zod schemas, token counter, rate-limit) | Highest — catches frontmatter drift |
| **Playwright** | `^1.48` | E2E: login → onboarding → complete topic → chat | Highest — protects critical path |
| **`@axe-core/playwright`** | `^4` | Accessibility violations per route | High — see §7 |
| **Storybook** | `^8` | Component isolation, visual regression via Chromatic | Medium — worth it once UI stabilizes |
| **Prisma integration tests** | via `vitest` + Testcontainers | Migrations + query correctness | Medium — add when schema stabilizes |

**What to test, concretely:**

1. **Content integrity (Vitest).** Load every lesson, assert: frontmatter validates against Zod; topic `order` values are unique within lesson; no duplicate slugs; every referenced image exists; internal links resolve. This is your `validate-content.ts` but with failure snapshots.

2. **Auth flow (Playwright).** Register → receive session cookie → onboarding → protected route reachable → logout → protected route redirects. Five tests, ~1 minute to run.

3. **Topic completion (Playwright).** Authenticated user navigates to a topic, scrolls, clicks "mark complete", refresh, progress persists. Covers the entire `UserProgress` stack.

4. **Chat (Playwright with mocked OpenRouter).** Use MSW or Playwright's `route.fulfill` to return a canned SSE stream. Assert: user message appears, assistant streams in, both persist in DB. Then inject a 500 — assert dangling user message is NOT visible on reload (regression test for §5's bug).

5. **Admin impersonation (Playwright).** Non-admin user cannot hit `/admin/*`. Confirmed admin can list users but cannot escalate others — test the specific guardrails.

**CI pipeline (GitHub Actions):**

```yaml
jobs:
  lint:    # eslint + tsc --noEmit, ~30s
  unit:    # vitest, ~20s
  e2e:     # playwright against Vercel preview URL, ~3 min
  a11y:    # axe + pa11y, ~2 min (runs against preview)
  lhci:    # lighthouse-ci, ~4 min (preview)
  size:    # size-limit, ~30s
```

PR cannot merge if any job fails. `e2e`, `a11y`, `lhci` depend on Vercel preview URL being ready — use the `vercel-actions/get-preview-url` action.

---

## 9. Developer experience

**Content authors (non-engineers) adding lessons:**

Option A (recommended): **GitHub web editor + PR preview.** Train one designer to open PRs directly in github.com. Vercel preview deploys every PR in ~90 seconds. They see their lesson rendered. A GitHub Actions comment posts the preview URL. No local dev needed. Add a `CONTENT.md` with frontmatter spec + examples.

Option B (heavier): **Keystatic or TinaCMS on top of the `content/` directory.** Git-backed CMS UI at `/admin/content`. Worth it at 3+ regular content authors; overkill for 1.

**Preview deployments per PR:** Native Vercel behavior, but add:
- Skip deploy if PR only touches `*.md` outside `content/` (docs-only changes).
- Post a "lessons changed" bot comment listing new/modified topic URLs on the preview.

**Local dev one-liner:**

```bash
pnpm install && pnpm db:setup && pnpm dev
```

Where `db:setup` runs: `docker compose up -d postgres && prisma migrate deploy && prisma db seed`. Include a `docker-compose.yml` with Postgres 16. The reference uses Neon only — new devs wait on a branch database provisioning; local Docker is instant.

Alternative: **Neon branching + `.env.local.<branch>`** — free tier supports it, each dev gets an isolated DB branch. Document both.

**Type safety for frontmatter (repeated from §3):** Fumadocs generates `.source/` types; ESLint rule `no-restricted-imports` blocks importing raw `gray-matter` output anywhere except `lib/content.ts`. One source of truth.

---

## 10. Technical risks — top 5 and mitigations

### Risk 1: OpenRouter/OpenAI cost spiking

**Scenario:** Viral tweet, 10k visitors, each sending 20 chat messages at 2k tokens = $200/day on `gemini-flash` or $2000/day if you ever switch to `gpt-4o`.

**Mitigations:**
- Hard daily budget in Vercel AI Gateway (supports spend limits per key). Set `$10/day` hard cap in v1; bump as revenue appears.
- Per-user daily message cap (Redis counter, 100/day free tier, higher on paid).
- `max_tokens: 800` ceiling.
- CAPTCHA (hCaptcha) on registration after 100 signups/hour from a single country.
- `robots.txt` disallow `/api/chat` (bots occasionally try).

### Risk 2: Neon free tier limits

**Scenario:** Free tier = 0.5 GB storage, 190 compute hours/month, auto-suspend after 5 min idle. Cold start adds 500+ ms to first request after idle.

**Mitigations:**
- Upgrade to Neon Launch ($19/mo) before public launch — no suspend, 10 GB.
- `ChatMessage` grows fast; prune messages older than 90 days via a weekly Vercel cron.
- Connection pooling via `@neondatabase/serverless` (not node-postgres) — set in `DATABASE_URL` with `?pgbouncer=true&connection_limit=1` for serverless.
- Monitor storage via Neon's API in a weekly cron → Slack webhook.

### Risk 3: Content divergence RU ↔ EN

**Scenario:** You start EN translation, 30 lessons translated, RU authors add 5 new lessons, the EN track silently falls behind, users hit "перевод скоро" on 10% of pages.

**Mitigations:**
- `translations: ["en"]` field in frontmatter — CI asserts parity or explicitly declares gaps.
- Translation-status dashboard at `/admin/i18n` counting parity per track.
- Weekly digest: "5 RU topics added this week, 2 need EN translation".
- Soft-launch EN only when ≥90% parity.

### Risk 4: Vendor lock-in

**Vercel**: tolerable. Next.js runs anywhere; main lock-ins are `next/og`, Vercel Blob, Vercel Analytics. All replaceable (Satori, S3, Plausible).
**Neon**: Postgres is Postgres. Migration to Supabase or RDS is a day's work if needed.
**OpenRouter**: good — already abstracts over providers. Use AI SDK `ai` to add another layer.
**next-auth v4**: **biggest risk**. v4 is maintenance-only. Plan migration to Auth.js v5 within 6 months. Do not ship new auth features on v4.

### Risk 5: Security — admin impersonation & XSS via user-submitted markdown

The plan's `Submission.description` is `@db.Text`. If that description is ever rendered as HTML (even via `react-markdown` with a lax rehype config), you have XSS.

**Mitigations:**
- Render `description` via **plain-text** renderer only, or `react-markdown` with `rehype-sanitize` and the `defaultSchema` restricted further (no `iframe`, no `script`, no `on*` attributes).
- `feedback` field (AI-generated) — also sanitize; prompt injection can make the model emit `<script>` tags.
- CSP headers already set in `next.config.ts` (reference line 3–16) — **tighten `Content-Security-Policy`**: currently not set. Add:

```ts
{ key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; frame-src 'self' https://www.figma.com https://www.youtube.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://openrouter.ai;" }
```

  Use `nonce`-based script-src in production (drop `unsafe-inline`). Next.js 16 supports nonce middleware.

- **Admin impersonation.** The reference has `role === "ADMIN"` checks scattered. Add a `requireAdmin()` audit-log — every admin action writes to an `AdminAuditLog` table (who, what, when, target). Deters and traces abuse.
- **Image uploads (Submission.imageUrl).** Use Vercel Blob with signed PUT URLs; validate MIME server-side before accepting the final URL. Reject SVG (XSS vector) or require `image/svg+xml` → sanitize with DOMPurify's SVG profile.

---

## Summary — prioritized action list before writing a single lesson

1. **Replace runtime MD with MDX + Fumadocs + Zod frontmatter validation.** 1 day, saves weeks.
2. **Fix the chat orphaned-message bug** via transactional write + status column + `cancel()` handler. Half a day.
3. **Add `track` and `level` denormalization to `UserProgress`** + indexes. 1 hour.
4. **Define performance & a11y budgets in CI** (Lighthouse CI, axe-playwright, size-limit) — PR gating from day one. Half a day.
5. **Per-user rate limit + AI cost ceiling.** 2 hours.
6. **`SNAPSHOT.md` documenting the diabolus commit you copied from** + `make diff-upstream`. 30 minutes.
7. **CodeMirror 6 + iframe playground instead of Sandpack** for v1. 1 day.
8. **Tighten CSP, add `Content-Security-Policy` header.** 1 hour.
9. **Docker-compose for local Postgres; pnpm scripts for one-liner setup.** 2 hours.
10. **Storybook + axe addon + 5 Playwright e2e tests covering the critical path.** 1 day.

Estimated total: ~5 engineer-days before content work begins. In return you avoid at least 10 days of rework and a probable public-facing incident around billing or XSS.

The plan itself is coherent and the diabolus foundation is solid. These changes turn a "personal-project rewrite" into something you can charge for without flinching.
