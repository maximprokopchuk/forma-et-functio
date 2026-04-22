# Forma et Functio — план имплементации

Образовательный портал по веб-дизайну. Референс-проект: `diabolus-in-musica` (теория музыки).

## 1. Позиционирование

**Название:** Forma et Functio (Форма и Функция) — отсылка к принципу Луиса Салливана "form follows function" (1896), ставшему краеугольным камнем индустриального и цифрового дизайна.

**Аудитория:**
- Начинающие UI/UX-дизайнеры
- Фронтенд-разработчики, углубляющиеся в дизайн
- Продуктовые дизайнеры, систематизирующие знания
- Студенты дизайн-школ

**Формат:** структурированные уроки с теорией, интерактивными примерами, чатом-ассистентом и трекингом прогресса.

## 2. Технический стек

Полное повторение стека `diabolus-in-musica` — проверено, стабильно, быстро.

- **Framework:** Next.js 16 (App Router), TypeScript
- **Стили:** Tailwind v4, `@custom-variant dark`, next-themes
- **Компоненты:** shadcn/ui, Base UI, Lucide icons
- **База:** PostgreSQL (Neon), Prisma 6
- **Аутентификация:** next-auth v4 (credentials + Google OAuth)
- **AI:** OpenAI API для чата
- **Контент:** файловый (Markdown + frontmatter в `content/lessons/`)
- **Деплой:** Vercel

**Отличия от референса:**
- Добавить **code playground** (iframe-sandbox для HTML/CSS/JS-примеров) — ключевая фича для дизайн-обучения
- Добавить **Figma-эмбеды** в темы (через официальный API Figma)
- Галерея **"до/после"** — разборы редизайнов реальных продуктов

## 3. Архитектура контента

### Вместо "инструментов" — "треки"

В диаболусе пользователь выбирает инструмент (гитара/бас/барабаны/клавиши). Здесь — профессиональный трек:

| ID | Трек | Фокус |
|----|------|-------|
| `GENERAL` | Общий дизайн | Теория, принципы, универсальные основы |
| `UI` | UI-дизайн | Визуальный дизайн интерфейсов, компоненты |
| `UX` | UX-дизайн | Исследования, IA, user flows, тестирование |
| `PRODUCT` | Продуктовый | Discovery, метрики, A/B, design ops |
| `FRONTEND` | Фронтенд для дизайнера | HTML/CSS/JS, фреймворки |
| `BRAND` | Брендинг и графика | Айдентика, логотип, типографика, иллюстрация |

### Уровни

`beginner` / `intermediate` / `advanced` — как в референсе.

### Структура разделов уроков

Каждый раздел (lesson) = директория в `content/lessons/<track>/<slug>/` с `index.md` (метаданные + описание) и `01-topic.md`, `02-topic.md`, ...

**Frontmatter `index.md`:**
```yaml
---
title: "Типографика"
description: "Всё о шрифтах в вебе"
track: UI
level: beginner
order: 4
published: true
---
```

**Frontmatter темы:**
```yaml
---
title: "Иерархия и масштаб"
description: "Модульные шкалы, контраст размеров"
order: 3
---
```

## 4. План контента (первые 40 разделов)

### Общий дизайн (GENERAL) — теоретическая база

1. Введение в дизайн — история, роль, цели
2. Принципы гештальта — близость, сходство, замыкание, фигура/фон
3. Визуальная иерархия
4. Теория цвета — круг, гармонии, психология
5. Цветовые модели — RGB/HSL/OKLCH, gamut
6. Типографика — классификация, анатомия, пары шрифтов
7. Композиция — сетки, симметрия, баланс
8. Контраст и акцент
9. Пространство и ритм
10. Форма следует функции — принцип Салливана

### UI-дизайн (UI)

11. Атомарный дизайн (Brad Frost)
12. Компоненты и паттерны — buttons, forms, cards
13. Навигация — меню, табы, хлебные крошки
14. Формы — UX-паттерны, валидация, ошибки
15. Таблицы и данные
16. Модальные окна, тосты, попапы
17. Состояния компонентов — hover/active/disabled/loading
18. Микровзаимодействия и анимация
19. Иконография — стили, системы, скругления
20. Дизайн-системы — Material, HIG, Fluent, Tailwind

### UX-дизайн (UX)

21. User research — интервью, observations, surveys
22. Personas и jobs-to-be-done
23. Information architecture — card sorting, trees
24. User flows и customer journey maps
25. Wireframing — low/high fidelity
26. Прототипирование — Figma, Principle
27. Юзабилити-тестирование
28. Метрики дизайна — NPS, SUS, CES, adoption
29. Accessibility — WCAG 2.2, ARIA, screen readers
30. Когнитивная нагрузка

### Фронтенд для дизайнера (FRONTEND)

31. HTML: семантика и структура
32. CSS-основы — селекторы, каскад, специфичность
33. Box model и позиционирование
34. Flexbox глубоко
35. CSS Grid глубоко
36. Адаптивный дизайн — breakpoints, container queries
37. Тайпскейлинг и fluid typography
38. CSS-переменные и темы
39. Анимации и transitions
40. Производительность — Core Web Vitals, lazy-loading

(Дальше: Brand, Product — по аналогии, расширение до ~100 разделов на первом году)

## 5. UI/UX-направление портала (отличия от референса)

Диаболус тёмно-готичный, crimson-акцент, "оккультный" колорит. Forma et Functio должен выглядеть **минималистично и типографично** — как Swiss design meets современный web.

**Визуальный язык:**
- **Палитра:** нейтральная база (off-white / #FAFAF9, графит #111), один яркий акцент (electric blue #3D5AFE или red-orange #FF5722)
- **Типографика:** крупные заголовки геометрическим гротеском (Inter, Space Grotesk или Neue Haas), основной текст — тот же Inter
- **Grid:** 12-колоночный, выраженный — с видимыми направляющими в hero-блоках
- **Imagery:** никаких стоковых фотографий; вместо них — иллюстрированные схемы, диаграммы, типографические постеры
- **Темы:** light + dark, но light — основная, в отличие от диаболуса

**Ключевые страницы (обновлённый дизайн):**
- Главная: огромный типографический hero "Форма. Функция." + сетка треков
- Страница трека: визуальная "карта" разделов
- Страница раздела: список тем с прогресс-индикатором
- Страница темы: двухколоночный layout — контент слева, интерактив справа
- Онбординг: трек → уровень → цели

## 6. Фичи (что переносим / что новое)

### Из диаболуса 1:1

- Файловая система контента (Markdown + frontmatter)
- Аутентификация next-auth + Google OAuth
- Онбординг (с адаптацией полей)
- Прогресс-трекинг (UserProgress по slug'ам)
- AI-чат в теме (OpenAI)
- Админ-панель (/admin): юзеры, уроки, репорты
- Репорты об ошибках в уроках
- Фильтры уровней в профиле
- Валидация контента (`npm run validate`)
- Моб.-адаптив, горизонтальная навигация в админке
- Футер с хешем коммита

### Новое для дизайна

1. **Code playground** — iframe-sandbox с live-preview HTML/CSS/JS. Использовать `Sandpack` (`@codesandbox/sandpack-react`) или свой минимальный.
2. **Figma embeds** — через `<iframe src="https://www.figma.com/embed?...">` — показ прототипов и файлов в уроках.
3. **"Было/стало"** — компонент разбора редизайнов: перетаскиваемая полоска сравнения двух скриншотов.
4. **Цветовые палитры** — интерактивный color picker в уроках по цвету (показать контрастность по WCAG).
5. **Type specimen** — превью шрифтов с настройкой размера/вес/трекинга.
6. **Design challenges** — задачи с submission: пользователь загружает Figma-ссылку / скриншот, получает AI-фидбек.

## 7. База данных (изменения от диаболуса)

**User model:**
- `preferredInstrument` → `preferredTrack` (enum с новыми значениями)
- `preferredLevel`, `showAllLevels`, `onboardingCompleted` — без изменений

**Новые модели:**
```prisma
model Submission {
  id         String   @id @default(cuid())
  userId     String
  topicSlug  String
  lessonSlug String
  figmaUrl   String?
  imageUrl   String?
  description String  @db.Text
  feedback   String? @db.Text
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}
```

`UserProgress`, `ChatMessage`, `ErrorReport`, `Account`, `Session`, `VerificationToken` — идентичны.

## 8. Фазы имплементации

### Фаза 0: Скелет (1 день)

- [ ] Инициализировать Next.js 16 + TypeScript
- [ ] Установить зависимости (shadcn, prisma, next-auth, tailwind v4 и т.д.)
- [ ] Скопировать структуру `src/`, `prisma/`, конфиги из диаболуса как стартовую точку
- [ ] Переименовать брендинг (Logo, favicon, metadata, package.json)
- [ ] Настроить БД (Neon) и env vars
- [ ] Первый деплой на Vercel

### Фаза 1: Контент-пайплайн (2 дня)

- [ ] Переписать `src/lib/content.ts` под новые enum'ы (track вместо instrument)
- [ ] Обновить Prisma-схему (Track enum, Submission model, remove/keep fields)
- [ ] Адаптировать онбординг под треки
- [ ] Адаптировать API `/api/user/preferences`, `/api/lessons`
- [ ] Написать валидатор контента (адаптация `scripts/validate-content.ts`)

### Фаза 2: Новый UI (3 дня)

- [ ] Дизайн-токены в `globals.css` (новая палитра, шрифты)
- [ ] Переработать `Logo` — типографический знак "F•F" или просто "Forma"
- [ ] Главная страница с новым hero
- [ ] Страница трека (map layout)
- [ ] Страница раздела (progress-aware list)
- [ ] Страница темы (2-колонник с местом для интерактива)
- [ ] Админка — только минимальная брендированная адаптация

### Фаза 3: Интерактивные фичи (3 дня)

- [ ] Code playground (Sandpack) с двумя вкладками: "попробовать" и "решение"
- [ ] Компонент Figma embed (markdown syntax: `:::figma url=...`)
- [ ] Компонент "до/после" (draggable divider)
- [ ] Компонент color palette / contrast checker
- [ ] Компонент type specimen
- [ ] Submission flow + AI feedback

### Фаза 4: Контент (постоянно)

- [ ] Написать первые 10 уроков (GENERAL) — обязательные для всех
- [ ] Написать следующие 10 уроков (UI) — большинство пользователей
- [ ] ... (расписать треки по приоритету)

### Фаза 5: Полировка

- [ ] Моб.-адаптив (copy-paste из диаболуса + тесты)
- [ ] SEO метаданные для всех треков/разделов/тем
- [ ] OG-изображения (автогенерация в `opengraph-image.tsx`)
- [ ] Analytics (Plausible / Vercel Analytics)
- [ ] Валидатор контента в CI (`npm run validate` в preflight)
- [ ] Security review того, что переносим

## 9. Стратегия копирования из диаболуса

Не форкать репо — создать новый с нуля, но копировать **конкретные файлы** по списку:

**Копируем 1:1:**
- `src/lib/rate-limit.ts`
- `src/lib/auth.ts` + `src/lib/auth-guard.ts`
- `src/lib/db.ts`
- `src/middleware.ts`
- `src/components/ui/` (shadcn компоненты)
- `src/app/api/auth/` целиком
- Структуру `(auth)/login`, `(auth)/register`
- `next.config.ts`, `tsconfig.json`, `.eslintrc`
- `scripts/validate-content.ts`

**Копируем с правками:**
- `prisma/schema.prisma` (рефакторинг enum'ов + Submission)
- `src/app/(auth)/onboarding/page.tsx` (instrument → track)
- `src/app/api/user/preferences/route.ts`
- `src/app/(public)/lessons/*` (дизайн)
- `src/app/admin/*` (дизайн)

**Пишем с нуля:**
- Весь контент (`content/lessons/`)
- `Logo`, `Footer`, брендинговые компоненты
- `globals.css` — новая дизайн-система
- Интерактивные виджеты (Sandpack, Figma embed, etc.)

## 10. Критерии готовности v1

- 40+ уроков на русском, покрывающие GENERAL (10) + UI (10) + UX (10) + FRONTEND (10)
- Работающий code playground минимум в 10 темах
- AI-чат с контекстом темы
- Прогресс по всем урокам
- Моб.-адаптив
- Репорт-об-ошибке во всех темах
- Deploy на Vercel с кастомным доменом
- Lighthouse 90+ по всем метрикам на главной и странице темы

## 11. Открытые вопросы

- **Монетизация:** бесплатно? paywall после 10 тем? подписка? — решить до v1
- **Сообщество:** комментарии под уроками? галерея работ студентов? — не обязательно для v1
- **i18n:** сначала русский, English — на будущее, но закладывать архитектуру (директория `content/lessons/<locale>/<track>/`)
- **Сертификация:** выдавать PDF-сертификат по завершении трека? — не для v1
