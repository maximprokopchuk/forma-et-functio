# Forma et Functio

Самоучитель цифрового дизайна на русском. Интерактивные виджеты,
MDX-уроки, AI-фидбек по рубрике, публичная галерея работ, streaks.

**Название** — отсылка к принципу Луиса Салливана "form follows function" (1896).

## Tech stack

- **Next.js 16** (App Router, MDX, Server Components)
- **TypeScript 5** — strict mode
- **Tailwind CSS 4** (no-preflight, custom tokens)
- **Prisma 6 + PostgreSQL** (Neon в prod, Docker локально)
- **NextAuth** (credentials + Google OAuth)
- **Vercel AI SDK v5** + **OpenRouter** (Claude / GPT-4 через gateway)
- **Playwright** (critical-path e2e)
- **next-mdx-remote** для рендеринга уроков; `@next/mdx` для static-content pages

## Локальная разработка

```bash
# 1. БД — docker compose поднимает Postgres 17 на 5432
pnpm db:up

# 2. Зависимости
pnpm install

# 3. Схема БД
pnpm db:push

# 4. Скопируйте .env
cp .env.example .env.local
# заполните DATABASE_URL, NEXTAUTH_SECRET, OPENROUTER_API_KEY

# 5. Dev server
pnpm dev
# → http://localhost:3000
```

## Скрипты

| Команда | Что делает |
|---|---|
| `pnpm dev` | Next dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm validate` | Zod-валидация MDX-фронтматтеров |
| `pnpm test:e2e` | Playwright (требует запущенный dev) |
| `pnpm db:push` | Синк Prisma-схемы без миграции |
| `pnpm db:migrate` | Создать и применить миграцию |
| `pnpm db:studio` | Prisma Studio UI |
| `pnpm make-admin` | Повысить пользователя до `ADMIN` |

## Environment variables

См. `.env.example`. Обязательные:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Postgres (Neon pooled или локальный Docker) |
| `DIRECT_DATABASE_URL` | Direct URL для миграций (Neon) |
| `NEXTAUTH_URL` | `http://localhost:3000` локально, канонический домен в prod |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `OPENROUTER_API_KEY` | AI-фидбек |
| `AI_MAX_DAILY_USD` | Cap на день для AI |

Опциональные:

| Переменная | Назначение |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Sign-in через Google |
| `CRON_SECRET` | Shared secret для `/api/cron/*` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Если задан — включается Plausible |
| `NEXT_PUBLIC_SITE_URL` | Prod-домен; используется в sitemap/robots/metadataBase |

## Deploy to Vercel

1. `vercel link` (или `vercel link --repo` если в monorepo).
2. Установите env-vars в Vercel dashboard (или `vercel env add`):
   - `DATABASE_URL`, `DIRECT_DATABASE_URL` — Neon
   - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
   - `OPENROUTER_API_KEY`, `AI_MAX_DAILY_USD`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth console
   - `CRON_SECRET` — для защиты `/api/cron/retry-submissions`
   - `NEXT_PUBLIC_SITE_URL` — канонический URL
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (опц.)
3. Cron-job уже задан в `vercel.json` — каждые 6 часов дёргает
   retry-submissions. Не забудьте `CRON_SECRET`, иначе 401.
4. `vercel deploy --prebuilt` или push в main.

### Первый админ

После первого `sign-up` на prod-домене, локально подключитесь к prod-БД
через `DATABASE_URL` и запустите:

```bash
DATABASE_URL="prod-url" pnpm make-admin you@example.com
```

Эта команда меняет `role` на `ADMIN`. После этого `/admin` становится
доступен.

## Структура

- `src/app/` — роуты App Router (public / auth / dashboard / admin / api)
- `src/components/` — UI, виджеты, MDX-компоненты, chat, progress
- `src/lib/` — content-loader, auth, rate-limit, AI, rubrics
- `content/lessons/ru/` — MDX-уроки
- `prisma/schema.prisma` — модели БД
- `tests/e2e/` — Playwright
- `docs/implementation-plan.md` — полный план (v2)

## Документация

- [План имплементации](docs/implementation-plan.md)

## Статус

Phase 7 (launch prep) — завершена: SEO-метадата, OG-images (root + topic),
sitemap/robots, security headers, Playwright (8 passing), middleware→proxy.
