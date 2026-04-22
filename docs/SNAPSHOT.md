# Snapshot: diabolus-in-musica reference

Этот проект копирует архитектуру и часть кода из `diabolus-in-musica`. Для предотвращения драфта знаем точный commit-snapshot.

## Снапшот

- **Source repo**: `/Users/maksimprokopcuk/repo/diabolus-in-musica` (github.com/maximprokopchuk/diabolus-in-musica)
- **Commit SHA**: `d964637038e2fa172cf71b6d319b14cef07e2d30`
- **Short SHA**: `d964637`
- **Commit message**: `fix: redirect logged-in users away from /login and /register`
- **Snapshot date**: 2026-04-22

## Что скопировано 1:1

Файлы со статусом `copied-unchanged` сверяем с upstream квартально:

- `src/lib/rate-limit.ts` — sliding window (in-memory). План: миграция на Upstash Redis до public launch.
- `src/lib/db.ts` — Prisma singleton
- `src/components/ui/` — shadcn компоненты
- `src/app/api/auth/` — next-auth routes (план миграции на Auth.js v5 в 6 мес)
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- `src/middleware.ts` — после copy запустили `@next/codemod middleware-to-proxy` для Next 16

## Что скопировано с правками

Файлы со статусом `copied-modified` — diff от reference хранится в `docs/drift/`:

- `prisma/schema.prisma` — полностью переработана схема (см. §10 плана)
- `src/lib/auth.ts` — `preferredInstrument` → `preferredTrack`
- `src/lib/content.ts` — **заменён на Fumadocs-based loader**
- `src/app/(auth)/onboarding/page.tsx` — Track вместо Instrument
- `src/app/api/user/preferences/route.ts` — Track
- `src/app/(public)/lessons/*` — новый editorial дизайн
- `src/app/admin/*` — брендированные правки

## Что написано с нуля

- `content/` полностью
- Визуал: `Logo`, `Footer`, `globals.css`, token system
- Custom icon library "Marks"
- Interactive widgets
- MDX/Fumadocs content loader

## Как сравнивать с upstream

Скрипт `make diff-upstream` (Makefile):

```makefile
diff-upstream:
	@git --git-dir=/Users/maksimprokopcuk/repo/diabolus-in-musica/.git \
		diff d964637..main -- src/lib/ src/middleware.ts src/app/api/auth/
```

Запускать квартально. Обновить этот SNAPSHOT с новым SHA когда подтянули нужные изменения.

## Security-patch watch

Подписаться на GitHub labels `security` и `bug` в diabolus-in-musica, чтобы не пропустить важные фиксы:

- https://github.com/maximprokopchuk/diabolus-in-musica/issues?q=label%3Asecurity
- https://github.com/maximprokopchuk/diabolus-in-musica/issues?q=label%3Abug
