# Technical debt и оставшаяся работа

Живой документ. Обновлять при обнаружении новых item'ов и при закрытии существующих.

Категоризация:
- **P0** — блокирует production / security / correctness
- **P1** — ухудшает UX или devex, но запустить можно
- **P2** — планируемые улучшения, не срочные
- **P3** — ideas / maybe-later

---

## P0 — блокеры до public launch

### P0.1 Upstash Redis rate limiter
- **Где:** `src/lib/rate-limit.ts`
- **Проблема:** текущий rate-limit — in-memory Map, работает на одном процессе. На Vercel при serverless fan-out каждый Lambda-инстанс имеет свой счётчик — лимит легко обходится.
- **Решение:** мигрировать на Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`). Заложить токены `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Оценка:** 2-3 часа
- **Источник:** plan §19, flagged across Phase 4/5 reports

### P0.2 Миграция next-auth v4 → Auth.js v5
- **Где:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **Проблема:** next-auth v4 в maintenance-only. CVE будут, backport не гарантирован.
- **Решение:** переход на Auth.js v5 (new config shape, exported `auth()` helper вместо `getServerSession`).
- **Оценка:** 1 день
- **Источник:** plan §25 Risk #4

### P0.3 CSP `unsafe-inline`/`unsafe-eval` в prod
- **Где:** `next.config.ts`
- **Проблема:** Dev CSP разрешает `unsafe-inline` и `unsafe-eval`. В prod должен быть nonce-based script-src.
- **Решение:** middleware/proxy inject nonce в каждый response, на layout.tsx читать nonce и передавать в `<Script>`, `<script>` inline.
- **Оценка:** 3-4 часа
- **Источник:** plan §25 Risk #5

### P0.4 Orphaned PENDING chat-rows sweep
- **Где:** нужен new cron-endpoint
- **Проблема:** plan §11 упоминает cleanup PENDING сообщений старше 2 минут. Не реализовано. Без этого DB засоряется если процесс падал до finalize.
- **Решение:** `/api/cron/sweep-pending-chat` → `DELETE FROM chat_messages WHERE status='PENDING' AND created_at < NOW() - INTERVAL '2 minutes'`. Cron в `vercel.json` hourly.
- **Оценка:** 30 мин
- **Источник:** Phase 4 agent report

---

## P1 — желательно до first real user

### P1.1 Контент-долг: ~57 тем до v1 target
- **Где:** `content/lessons/ru/`
- **Текущее состояние:** 8 тем в 5 разделах (Phase 6 batch 1)
- **Цель v1:** 65 тем = FOUNDATIONS 15 + INTERFACE 25 + EXPERIENCE 15 + CRAFT 10
- **Отставание:** 57 тем
- **Решение:** профессиональные авторы-дизайнеры (нужен план найма 2-3 человек × 3-4 месяца), не массовая AI-генерация. AI может дать первый драфт, но требует экспертной вычитки.
- **Оценка:** 3-4 месяца командой 2-3 авторов

### P1.2 Email digest (Resend)
- **Проблема:** plan §17 retention mechanic — weekly digest и streak-save notifications. Не реализовано.
- **Решение:** Resend API + template + cron weekly.
- **Оценка:** 1 день
- **Блокеры:** Resend API key у пользователя

### P1.3 Наблюдаемость (Sentry / Axiom)
- **Проблема:** нет error tracking, нет APM, нет alerting на падения stream'ов или OpenRouter 5xx.
- **Решение:** Sentry SDK + source maps upload в Vercel. Или Vercel Observability (встроенный).
- **Оценка:** 2 часа

### P1.4 Интерактивные widgets 6-14
Plan §7 упоминает 14 виджетов. Сделано 5.
- **Отсутствуют:**
  - Before/after slider с annotation layer
  - Critique mode (пины + сравнение со story)
  - Component state explorer
  - Principle-checker (автоматический bbox на нарушения alignment)
  - Flow builder
  - Figma → code (JSON токены → CSS variables)
  - Live WCAG-check в playground
  - Motion-curve editor
  - Grid builder
- **Оценка:** ~1 день на widget (9 дней total), не равномерно

### P1.5 Submission image upload
- **Где:** `src/components/submissions/submission-form.tsx`
- **Текущее:** кнопка "Загрузить скриншот" — disabled placeholder "Скоро"
- **Решение:** Vercel Blob signed PUT URL, MIME check, DOMPurify для SVG (XSS risk).
- **Оценка:** половина дня
- **Источник:** plan §25 Risk #5

### P1.6 Per-user daily AI cost ceiling
- **Проблема:** есть rate-limit (20 msg/min), но нет daily cap. Реализация mock-tracks usage в `ChatUsage`, но не блокирует при превышении.
- **Решение:** daily Redis counter (UserDailyAICost), hard cap 100 msg/day на chat, 10/day на submission feedback. При превышении friendly "подождите до завтра".
- **Оценка:** 2 часа

### P1.7 Admin audit log viewer UI
- **Где:** `src/app/admin/audit/`
- **Текущее:** AdminAuditLog пишется при каждом admin-действии, но UI для просмотра нет.
- **Решение:** простая таблица с пагинацией, фильтр по admin/action/target.
- **Оценка:** 2 часа

### P1.8 NextAuth JWT не подтягивает `name`
- **Где:** `src/lib/auth.ts`, JWT callback
- **Проблема:** onboarding обновляет `User.name`, но JWT не re-fetch'ит. `session.update()` не освежает name до re-login.
- **Решение:** добавить `name` в `authOptions.callbacks.jwt` select.
- **Оценка:** 10 мин
- **Источник:** Phase 1 agent report

### P1.9 Widget props для variant
- **Где:** `src/components/widgets/`
- **Проблема:** `ColorContrastSandbox`, `SpacingTuner`, `TypePairingLab` имеют hard-coded sample composition. Нельзя делать специализированные уроки "spacing в формах", "contrast в дашбордах".
- **Решение:** добавить `variant?` prop (например, `"card" | "form" | "dashboard"`) + data props.
- **Оценка:** 2-3 часа на все 3
- **Источник:** Phase 6 agent report

---

## P2 — полировка

### P2.1 `0.5px` hairlines на non-retina
- **Где:** `src/app/globals.css` — используется `scaleY(0.5)` transform
- **Проблема:** на non-retina дисплеях hairline может исчезать. Plan §16 требует 0.5px.
- **Решение:** `@supports` с `device-pixel-ratio > 1` query, для non-retina использовать 1px.
- **Оценка:** 1 час

### P2.2 Фавиконка / App Icon
- **Где:** `src/app/`
- **Текущее:** default Next.js icon
- **Решение:** создать SVG favicon на основе F·F ligature (как в diabolus делали для музыкального символа). Plus `apple-icon.tsx`, `icon.tsx` варианты.
- **Оценка:** 1-2 часа

### P2.3 8-колоночный tablet layout
- **Где:** `src/app/globals.css` — `.grid-16`
- **Текущее:** на tablet (768-1279) grid схлопывается сразу в single-column
- **Проблема:** plan §16 требует 8-col tablet pattern (content 1-6, notes 7-8)
- **Оценка:** 1 час
- **Источник:** Phase 1 agent report

### P2.4 Dark mode italic body (decision pending)
- **Где:** `src/app/globals.css`
- **Проблема:** plan §15 предлагает italic body по умолчанию в dark mode ("studio at night" register). Реализация требует toggle.
- **Решение:** добавить user preference `prefersItalicDarkBody` в profile settings + toggle в header near ThemeToggle.
- **Оценка:** 3 часа (schema + API + UI)
- **Источник:** Phase 1 design audit

### P2.5 `@ai-sdk/react` useChat hook
- **Где:** `src/components/chat/chat-panel.tsx`
- **Текущее:** manual fetch + ReadableStream.getReader()
- **Проблема:** функционально работает, но `useChat` даёт abort handling, edge cases, и reduce'ит surface code.
- **Решение:** добавить `@ai-sdk/react`, переписать submit path.
- **Оценка:** 2 часа
- **Источник:** Phase 4 agent report

### P2.6 Margin notes на mobile
- **Где:** `src/components/mdx/margin-note.tsx` + `globals.css` float rules
- **Текущее:** float:right на ≥1280px, inline с hairline на mobile
- **Проблема:** inline notes на mobile ломают reading rhythm
- **Решение:** collapsible <details> сниппет или expandable in-flow с явной discrimination
- **Оценка:** 2 часа

### P2.7 APCA contrast automated audit
- **Где:** CI
- **Решение:** `@adobe/leonardo-contrast-colors` script, reads `globals.css` tokens, asserts ≥4.5:1 body и 3:1 large в обеих темах. Fail PR на регрессии.
- **Оценка:** 2 часа
- **Источник:** plan §13

### P2.8 Text alt enforcement в MDX
- **Где:** MDX pipeline
- **Решение:** custom remark plugin fails билд на пустом alt. Linter-правило `jsx-a11y/alt-text` на MDX.
- **Оценка:** 1 час

### P2.9 `<MarginNote>` hydration warning
- **Где:** `src/components/mdx/margin-note.tsx`
- **Проблема:** nested `<p>` внутри MDX-параграфа может давать hydration mismatch warning (pre-existing, not regression).
- **Решение:** переключить на `<span className="mdx-margin-note">` с display:block OR переместить margin-note вне абзаца через remark plugin.
- **Оценка:** 1-2 часа

### P2.10 `/login` и `/register` через middleware/proxy
- **Где:** `src/proxy.ts` + auth pages
- **Текущее:** логика редиректа авторизованных работает
- **Улучшение:** добавить preview deploy проверки e2e

---

## P3 — nice to have / идеи

### P3.1 Fumadocs миграция
- **Где:** content pipeline
- **Текущее:** light-weight `next-mdx-remote` + gray-matter + Zod
- **Причина рассмотреть:** Fumadocs даёт автоматические ToC, sidebar-nav из frontmatter, search, ссылки между темами. Но heavier ecosystem.
- **Блокер:** не до 30+ тем накопится

### P3.2 Cohorts
- plan §17 mid-term. Группы по 30 человек, sync chat room, peer-review. Нужен MAU > 1000.

### P3.3 Monthly design challenge
- plan §17. UI есть (можно как отдельную страницу `/challenge`), но логика (дедлайны, voting, топ-10 на главной) — отдельная работа.

### P3.4 PWA / offline
- plan §26. Service worker для оффлайн чтения. Для edtech с длинными теоретическими топиками — big UX win.

### P3.5 i18n: English track
- plan §23 Phase 7 open question. Ru-launch в v1, EN — после validated demand. Архитектура для этого готова (`content/lessons/<locale>/...`, `translations` frontmatter field).

### P3.6 PDF-сертификат
- plan §26 open question. Выдавать при completion трека. Не критично — portfolio важнее (plan §4.4).

### P3.7 GT Alpina вместо PT Serif
- Текущее: Newsreader (latin) + PT Serif (cyrillic) через next/font
- Проблема: PT Serif x-height немного выше, видно на смешанных словах
- Решение: купить GT Alpina (paid), self-host, subset для CYR
- Стоимость: $200+/licence, OK для серьёзного launch

### P3.8 Widget 15+ — interactive design history timeline
- Бонусная идея: скроллимый timeline от Gutenberg до сегодня с ключевыми designers и их работами. Учебное украшение.

---

## Pre-launch user action checklist

1. **Neon prod DB**
   - Create project, pooled + direct URLs
   - Set `DATABASE_URL`, `DIRECT_DATABASE_URL` в Vercel env
   - `DATABASE_URL="..." pnpm exec prisma migrate deploy`

2. **Vercel project**
   - `vercel link`
   - Все env-vars:
     - `NEXTAUTH_URL` (canonical domain)
     - `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
     - `OPENROUTER_API_KEY`
     - `AI_MAX_DAILY_USD=10`
     - `CRON_SECRET` (для защиты `/api/cron/*`)
     - `NEXT_PUBLIC_SITE_URL` (для sitemap/OG)
     - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (если включаем Google OAuth)
     - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional)
   - `vercel --prod`

3. **Domain + DNS**
   - Point DNS на Vercel
   - Update Google OAuth Console redirect URI
   - Update `NEXTAUTH_URL` и `NEXT_PUBLIC_SITE_URL`

4. **Первый админ**
   ```bash
   # sign up через UI на prod-домене
   DATABASE_URL="prod-url" pnpm make-admin your@email.com
   # sign-out / sign-in — JWT обновится
   ```

5. **Vercel Cron**
   - `vercel.json` уже задан (every 6h, retry-submissions)
   - Убедиться что `CRON_SECRET` установлен

6. **Тестовый прогон**
   - Sign up как новый пользователь
   - Onboarding flow
   - Открыть урок, пройти quiz, пройти exercise
   - Отправить submission
   - Увидеть AI feedback (в mock mode если key пустой)
   - Опубликовать в галерею
   - Пройти тему → проверить что `currentStreak = 1`

7. **Monitoring**
   - Vercel Analytics (бесплатный tier)
   - OpenRouter dashboard — hard cap, alerts
   - Neon dashboard — storage usage

---

## Метрики здоровья проекта

Обновлять при каждой значимой итерации.

### Код
- Файлов TypeScript: ~100
- Строк кода (оценка): ~12,000
- Тестов e2e: 8 passing
- Покрытие: не измеряем (нет unit'ов)
- Зависимости (prod): 28
- Зависимости (dev): 15

### Контент
- Треков: 4 (FOUNDATIONS, INTERFACE, EXPERIENCE, CRAFT)
- Разделов: 5 (typography, color, hierarchy, buttons, + pending)
- Тем: 9 (анатомия, классификация, пары, теория цвета, OKLCH, иерархия, whitespace, варианты кнопок)
- Слов контента: ~12,500
- Rubric'ов: 2 (typography-anatomy-basic, color-contrast-basic)

### Инфраструктура
- Таблиц БД: 17
- API endpoints: 11 (+ auth)
- Public routes: 8
- Admin routes: 5
- Interactive widgets: 5

### Что полностью работает
- Регистрация + Google OAuth scaffold
- Onboarding (4 screens, editorial)
- Урок с MDX-контентом, drop cap, quiz, exercise, margin notes
- 5 interactive widgets (hierarchy-reorder, color-contrast, type-pairing, spacing-tuner, a11y-simulator)
- AI chat с streaming + mock mode
- Submissions с AI feedback + rubric-grading + mock mode
- Streaks (currentStreak + longestStreak)
- Public gallery с opt-in
- Error reports + admin triage
- Admin panel (users, submissions, error-reports, content parity)
- Light + dark mode ("Студия") refined
- SEO metadata + OG images + sitemap + robots
- Security headers (HSTS, CSP basic, X-Frame-Options и т.д.)
- Playwright e2e (8 tests)

### Что стоит на костылях
- Rate limit in-memory (P0.1)
- CSP `unsafe-inline` (P0.3)
- AI в mock mode без API-key (ожидаемо)
- next-auth v4 (P0.2)

---

## История фаз

| # | Название | Commit range | Основное |
|---|---|---|---|
| 0 | Bootstrap | initial | Next.js 16 + TS + Prisma + auth scaffold |
| 1 | UI System | ... | Wordmark + Marks + 16-col grid + homepage + scaffolds |
| 2 | Content pipeline | ... | MDX + first lesson + HierarchyReorder widget |
| Design pass | Design audit | ... | Dark mode "Студия" refined, cyrillic PT Serif fallback |
| 3 | Widgets v1 | ... | 4 more widgets + LazyMount + showcase page |
| 4 | Chat + submissions | ... | AI chat, submissions, streaks, gallery, rubrics |
| 5 | Admin panel | ... | Users, submissions, error-reports, content, audit log |
| 5.5 | Auth pages | ... | Login + register в editorial register |
| 6 batch 1 | Content | ... | 8 topics × 5 lessons × 2 tracks |
| 7 | Launch prep | ... | SEO, OG, sitemap, robots, proxy, tests, security headers |
