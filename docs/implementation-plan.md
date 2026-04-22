# Forma et Functio — план имплементации (v2)

Образовательный портал по веб-дизайну. Референс-архитектура: `diabolus-in-musica` (теория музыки).

Этот план — синтез трёх экспертных ревью (дизайнер/педагог, арт-директор, принципал-фронтенд). См. `docs/reviews/` для полных текстов. v1 плана — в git history.

---

## 0. Ключевые решения v2 (что изменилось от v1)

| Область | Было (v1) | Стало (v2) | Причина |
|---|---|---|---|
| Треки | 6 (GENERAL/UI/UX/PRODUCT/FRONTEND/BRAND) | **4** (FOUNDATIONS/INTERFACE/EXPERIENCE/CRAFT) | PRODUCT/UX пересекаются на 70%; BRAND — лишнее в web-курсе; FRONTEND — meta-трек, вплетён в другие |
| Цель v1 | 40 тем | **60+ тем** (12 разделов × 5 тем), рост до 150 за год | 40 тем = 10 часов контента = блог, не курс |
| Уровни | beginner/intermediate/advanced | Bloom-like 5-уровневая шкала (L1 Recognize → L5 Create) | Критично для AI-грейдинга |
| Assessment | "submission + AI feedback" | **Пирамида 7 типов упражнений**, rubric с reference examples, portfolio output | Без rubric LLM выдаёт мусор |
| Визуальная идентика | Swiss + Inter + off-white + electric blue | **Post-Swiss pedagogical**: Newsreader/GT Alpina + paper `#F4F1EA` + cinnabar `#D8412F` | Избегаем "ещё один SaaS-лендинг" |
| Logo | "F•F монограмма" (идея) | **Lowercase wordmark** `forma et functio` + F·F ligature с разделяющей точкой | Editorial, не product |
| Grid | 12 колонок | **16 колонок** с Tuftean margin notes | 12 — Bootstrap default; 16 даёт чистые 1/2, 1/4, 1/8 и полосу полей |
| Content pipeline | Runtime Markdown | **MDX + Fumadocs + Zod frontmatter** | 100+ уроков × runtime fs = 500-900мс TTFB; MDX даёт интерактивные компоненты inline |
| Code playground | "Sandpack или свой" | **CodeMirror 6 + `srcdoc` iframe** | Sandpack = 380KB gzip, CM6 = 80KB; дизайн-ученикам не нужен npm resolution |
| AI chat | Raw OpenAI SDK | **Vercel AI SDK v5** + транзакционная запись + `cancel()` для частичных ответов | Референс имеет bug: orphaned user messages при обрыве стрима |
| Retention | "Комьюнити после v1" | **Streaks + public gallery + monthly challenge в v1** | Ретеншн в edtech без социалки = 5-10% |

---

## 1. Позиционирование

### Бренд-позиция

**Forma et Functio — это разворот дизайн-учебника 1966 года, свёрстанный в браузере и работающий на Next.js.**

Не neo-Swiss, не "clean & modern", не "как у Vercel". Ориентир — **post-Swiss pedagogical**:

- **Эмиль Рудер, "Typographie" (1967)** — дидактические развороты, где сама вёрстка преподаёт
- **Карл Герстнер, "Designing Programmes" (1964)** — дизайн как система параметрических решений
- **Бруно Мунари, "Design as Art" (1966)** и детские книги — игривость, диаграммы, которые думают
- **Тотал-дизайн-эра**: Кроувел как педагог (New Alphabet)
- **Эхо конструктивизма** (Родченко, Лисицкий, LEF) — резонирует с русскоязычной аудиторией, ближе чем Гельветика

**Регистр: editorial, не software.** Каждая страница — это страница книги, не dashboard. Каждый раз, когда кто-то спросит "давайте сделаем живее / добавим градиентную карточку" — ответ **нет, сделаем строже**.

### Позиционирующее предложение

*«Самоучитель веб-дизайна с интерактивной практикой и AI-фидбеком — для тех, кто хочет дизайнить и понимать, как это реально работает в коде.»*

### Уникальное отличие от конкурентов

| Конкурент | Их сила | Их слабость | Наш ответ |
|---|---|---|---|
| Designlab | менторство 1-на-1 | английский, sync, платный | бесплатно, async, AI-грейдинг |
| IDF | огромная библиотека | скучный UI, слабые упражнения | интерактивные виджеты, современная вёрстка |
| Skillbox/BBE | рынок, маркетинг | устаревшие примеры (Photoshop), дорого | современный стек (Figma, Tailwind, OKLCH), бесплатно |
| Coursera (Google UX) | бренд, доступность | халявный peer review | AI-грейдинг с rubric |
| DesignCourse | практичность | несистемный YouTube | структура + прогрессия |

**Killer-фичи**: интерактивные виджеты (§5), AI-грейдинг с rubric (§4), portfolio-generator (§4), дизайн **через призму реализации**, полностью бесплатно.

---

## 2. Визуальная идентичность

### 2.1 Wordmark

**`forma et functio`** — lowercase, трекинг +20 на display-размере, `et` курсивом и чуть меньше (классическая манускриптовая конвенция).

Caps — "Forma et Functio" — запрещены. Capital F's агрессивны и англо; lowercase — книжно, европейски, резонирует с педагогическим регистром.

Набор:
- **Primary**: GT Alpina (Grilli Type) или — бюджетная альтернатива — **Newsreader** (Production Type, free в Google Fonts).
- Никакого Inter для wordmark. Inter — UI-шрифт без голоса.

### 2.2 Mark

**F·F ligature**: две F делят один горизонтальный кроссбар. Буквально "form follows function" как логика букв — вторая F появляется как следствие первой.

- **Favicon scale**: общий кроссбар превращается в типографскую центрированную точку (латинская инскрипционная пунктуация `F·F`)
- **Grid-variant**: 3×3 модуль, 4 заполненные ячейки — используется как паттерн на OG-изображениях и разделителях

**Запрет**: геометрическая абстракция (круг/квадрат/"inovative shape"), 3D, маскот.

### 2.3 Типографика

Три шрифта, roles defined:

1. **Display / headlines**: Newsreader (or GT Alpina) — серифный, с выразительным италиком. Для h1-h2 и editorial pull quotes.
2. **UI / running body**: Söhne (Klim, paid) или Inter Display с ручной оптической подгонкой. Нейтральный, отлично в 14-16px.
3. **Monospace**: Berkeley Mono (US Graphics) или JetBrains Mono. Code playground, термины в полях, determs.

**Не на странице**: Space Grotesk, Satoshi, Geist (Vercel voice), Neue Haas Grotesk в этой цветовой схеме.

### 2.4 Цветовая система

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| Paper | `paper` | `#F4F1EA` | — | Фон страницы, тёплый cream, не белый |
| Ink | `ink` | `#14110F` | — | Body text, тёплый near-black |
| Ink muted | `ink-60` | ink @ 60% | — | Secondary text |
| Rule | `rule` | `#C8C3B8` | `#2A2722` | Hairlines (0.5px) |
| Cinnabar | `cinnabar` | `#D8412F` | `#E8604D` | Primary accent (см. usage rules) |
| Lapis | `lapis` | `#1B3A8B` | `#4B6AC9` | Inline links (underlined), диаграммы |
| Ochre | `ochre` | `#E3B23C` | `#F0C858` | Callouts, "try this" prompts — sparingly |
| Paper dark | `paper-dark` | — | `#16130E` | Dark-mode bg: brown-black, not grey |
| Ink dark | `ink-dark` | — | `#ECE6D8` | Dark-mode body: cream, not white |

**Почему cinnabar (киноварь), не electric blue?** Electric blue — software-product colour. Red-orange — Material-3 construction-site. Cinnabar — пигмент средневековых русских икон, рубрикации в рукописях, исторически точный цвет, резонирует с аудиторией, близко к рыжим Родченко без пастиша.

**Usage rules:**
- Cinnabar — только на: primary CTA, currently-reading progress indicator, F·F mark в ключевые моменты. **Никогда** на больших фонах.
- Lapis — только inline-ссылки и диаграммы.
- Ochre — только "key insight" / "try this" блоки. Максимум 1 ochre-блок на тему.
- 90% работы делают paper и ink. Если сомневаешься — убери цвет.

### 2.5 Иконография — "Marks"

Не чистый Lucide в контенте. Lucide — для admin chrome и навигации.

**Custom icon language "Marks":**
- Сетка 24×24
- **Два веса штриха**: 1.5px для структуры, 0.5px для деталей
- **Square-cut terminals**, не скруглённые
- Каждая иконка имеет типографского родственника — если у концепта есть глиф (§, ¶, ‖, †), используем его до иконки
- 30 иконок для v1: концепт-маркеры (gestalt, hierarchy, rhythm, contrast, scale, grid), content-types (exercise, reading, watch, discuss, ship), states (in-progress, complete, needs-review)

---

## 3. Арт-дирекция контента

### 3.1 Три разрешённых типа hero-визуала

1. **Дидактические диаграммы** — вектор, который **и есть** урок (Kepes, Munari)
2. **Типографические specimens** — для тем про шрифт: specimen в display, с аннотациями
3. **Исторические воспроизведения** с атрибуцией — Müller-Brockmann, Lissitzky Proun, Glaser "I ♥ NY", Rodchenko

**Запрет**: сток-фото, isometric-human-illustration, 3D gradient blobs, Duolingo-owl aesthetic, AI-generated decoration.

### 3.2 Стиль диаграмм

- Flat вектор, два веса штриха (1.5px / 0.5px), paper background
- **Никаких теней, градиентов, 3D** — никогда
- Аннотации — italic serif, 12px, leader lines 0.5px cinnabar
- Measurement callouts — draftman convention (dimension lines, tick marks)
- Axonometric 30°/30° когда нужна глубина (не perspective, не cartoon-isometric)

### 3.3 Абстрактные концепты без фигуративной иллюстрации

- **Используй сам шрифт как иллюстрацию**: урок про иерархию показывает иерархию в 14 весах на собственном теле
- **Геометрические примитивы** (квадрат/круг/треугольник — Munari/Bauhaus): большой масштаб (70vh круг), не 48px иконка
- **Reduction** (Dieter Rams): кадр за кадром убираем лишнее, scroll-linked секвенции — sparingly

### 3.4 Принцип

**"Everything on screen must be learnable from."** Ни одного декоративного акцента, не демонстрирующего принципа. Hairline между секциями = потому что учим hairline. Type-size jump h3→body = 1.414× потому что учим √2 modular scale. Откройте DevTools — найдёте урок в CSS.

---

## 4. Архитектура контента

### 4.1 Четыре трека вместо шести

| ID | Название | Цель | v1 тем | финал |
|---|---|---|---|---|
| `FOUNDATIONS` | Основы | Перцепция, композиция, цвет, типографика, grid, brand-expression | **15** | 30 |
| `INTERFACE` | Интерфейсы | UI-паттерны, компоненты, состояния, системы, HTML/CSS как tool | **25** | 50 |
| `EXPERIENCE` | Опыт и исследования | Research, IA, flows, тестирование, метрики, a11y | **15** | 40 |
| `CRAFT` | Ремесло | Motion, prototyping, handoff, портфолио, критика, карьера | **10** | 30 |

**v1 = 65 тем. v2 (год 1) = 150 тем.**

### 4.2 Learning paths поверх треков

Настоящие дизайнеры учатся по **проектам**, не по трекам. Сквозные сценарии как первоклассная навигация:

- "Я делаю первый мобильный лендинг" — 20 тем из разных треков, упорядочены
- "Редизайн SaaS-дашборда" — 30 тем
- "Запуск design system с нуля" — 25 тем

UX-решение: на главной не "выберите трек", а "выберите цель" → система собирает путь.

### 4.3 Bloom-уровни вместо beginner/intermediate/advanced

- **L1 Recognize** — "это serif"
- **L2 Recall** — "это Didone, высокий контраст"
- **L3 Apply** — "подбери шрифт для finance-дашборда"
- **L4 Analyze** — "почему типографика Stripe работает"
- **L5 Create** — "разработай type system для e-commerce"

Каждая тема имеет явный `blooms_level: L3`. Критично для AI-грейдинга.

### 4.4 Frontmatter темы

```yaml
---
title: "Иерархия и масштаб"
description: "Модульные шкалы, контраст размеров"
order: 3
blooms_level: L3
estimated_minutes: 18
requires:
  - "foundations/typography-anatomy"
  - "foundations/modular-scale"
rubric_id: "hierarchy-basic"
exercise_types: ["knowledge_check", "reorder", "redesign"]
translations: ["en"]
---
```

Поля `requires` и `blooms_level` — основа learning paths и блокировок ("эта тема требует X").

---

## 5. Контент: outline v1

### FOUNDATIONS (15 тем)

1. Что такое дизайн — от Bauhaus до цифры; функция vs декорация; кейс iPhone settings 2007→2024
2. Перцепция и гештальт — близость/сходство/замыкание/figure-ground; упражнение перегруппировать карточки
3. Визуальная иерархия — размер/вес/цвет/позиция/whitespace
4. Композиция и сетки — rule of thirds, миф golden ratio в UI, 8pt grid, baseline
5. Цвет: теория — круг, гармонии, tints/shades/tones; интерактив
6. Цвет: системы — RGB/HSL/LCH/**OKLCH**; perceptual uniformity
7. Цвет: применение — 60/30/10, semantic, dark mode ≠ инверсия
8. Типографика: анатомия — x-height, ascender, counter, aperture
9. Типографика: классификация и пары — Vox-ATypI, contrast of axis
10. Иерархия в типографике — modular scale (1.25, 1.414), fluid type, clamp()
11. Пространство и ритм — vertical rhythm, optical alignment
12. Контраст — WCAG 2.2, **APCA**, live-tool
13. Брендинг как применение основ — Airbnb Bélo, Mailchimp, Linear identity
14. Иконография — стили, pixel grid, 24/20/16 сетки
15. Grids in depth — 16-колонник, container queries, subgrid

**Capstone FOUNDATIONS**: Style Sheet (8-страничный документ в Figma). Автопубликация в портфолио.

### INTERFACE (25 тем)

1. Atomic Design и его границы
2-10. Компоненты: Button / Input / Form / Card / Table / Nav / Modal / Toast / States-matrix
11-14. Empty / Error / Loading / Success states
15. Иконография в UI — stroke vs fill, optical sizing, 2px grid
16. Motion в UI — ease-out/ease-in, duration scale, когда motion вредит
17. Микроинтеракции — Saffer's 4 parts; кейсы Twitter heart, Stripe checkmark

18-22. **HTML/CSS как инструмент**: семантика, box model, Flexbox deep, Grid deep, container queries + subgrid + logical properties

23-25. **Design Systems**: tokens (color/space/type/motion), component API design, governance; разбор Material 3 / Radix / Polaris

**Capstone INTERFACE**: mini design system (8 компонентов) со Storybook-like превью + 3 редизайна.

### EXPERIENCE (15 тем)

1-4. Research: interviews / observation / usability tests (moderated/unmoderated) / surveys
5-6. Synthesis: affinity mapping, JTBD
7-8. IA: mental models, navigation patterns
9-10. Flows & journey maps
11. A/B и мультивариантные тесты — статзначимость
12-13. Метрики: HEART, SUS, NPS critique
14-15. A11y: WCAG 2.2 practical + cognitive accessibility

**Capstone EXPERIENCE**: research report + usability test report + journey map.

### CRAFT (10 тем)

1. Figma advanced — variables, interactive components
2. Motion: Principle, Rive, Lottie
3. Handoff: specs, tokens export
4. Portfolio: case study structure, storytelling
5. Critique: giving and receiving (SBI framework)
6-8. Data viz / dashboards / charts
9. Карьера: interviews, exercises, whiteboard
10. Design Ops: ritual, reviews, docs

**Финальный capstone**: портфолио-сайт, автогенерируемый из submissions.

### Маппинг на профессиональные rubric-системы

- **NN/g UX Certification** — все 5 areas (strategy/research/IA/UI/testing)
- **IDF Career Path UX Designer** — 8 курсов IDF ≈ EXPERIENCE + FOUNDATIONS
- **Google UX Certificate** — ~80% пересечение с EXPERIENCE
- **Awwwards Academy portfolio criteria** (craft/originality/usability/content/typography) — финальный capstone rubric

Каждая тема тегируется: "часть NN/g UX Strategy module" отображается в UI.

---

## 6. Assessment: пирамида упражнений

### Семь типов заданий (возрастающая когнитивная нагрузка)

1. **Knowledge check** (30 сек) — 1 MCQ/true-false после темы. Inline `:::quiz`. Детерминированная проверка.
2. **Visual recognition** (1-2 мин) — "какой пример использует правильный contrast". Клик по картинке.
3. **Reorder / sort** (2-5 мин) — drag-n-drop, детерминированная проверка.
4. **Spot-the-diff** (3-5 мин) — два UI, найти 5 нарушений.
5. **Critique exercise** (10-15 мин) — 200-400 слов критики реального UI. AI грейдит по rubric.
6. **Redesign challenge** (30-90 мин) — submit Figma-link. AI + опц. peer review.
7. **Case study** (дни) — финальный capstone трека.

Соотношение на тему: 2-3 knowledge checks, 1 mid-task (типы 2-4), 1 опциональный challenge (5-6).

### Rubric для AI-грейдинга

Без rubric + reference examples LLM выдаёт "looks good, consider improving contrast" на всё. Схема:

```yaml
# content/rubrics/hierarchy-basic.yaml
id: hierarchy-basic
dimensions:
  - id: hierarchy
    label: "Визуальная иерархия"
    weight: 0.25
    levels:
      1: "Нет явного порядка; элементы конкурируют."
      3: "Иерархия читается, 1-2 спорных акцента."
      5: "Чёткая иерархия через размер/вес/пространство; глаз ведётся."
  - id: alignment
    label: "Выравнивание и сетка"
    weight: 0.20
    levels: { 1: "...", 3: "...", 5: "..." }
  - id: typography
    weight: 0.20
  - id: color_contrast
    weight: 0.15
  - id: ux_clarity
    weight: 0.20
reference_examples:
  - url: "/assets/rubric/hierarchy-5.png"
    score: 5
    notes: "Тип-скейл чистый, единственный primary CTA..."
  - url: "/assets/rubric/hierarchy-2.png"
    score: 2
    notes: "Три конкурирующих акцента, CTA теряется..."
```

LLM-промпт вкладывает rubric + reference examples (multimodal — Claude Sonnet видит картинки). Без few-shot не работает.

### Portfolio output (не PDF-сертификат)

- После FOUNDATIONS: Style Sheet + 5 micro-exercises + 1 case study
- После INTERFACE: работающий mini design system + 3 редизайна
- После EXPERIENCE: research report + usability test + journey map
- После CRAFT + all tracks: **портфолио-сайт**, автогенерируется из submissions

Это killer-фича: студент выходит с реальным портфолио.

---

## 7. Интерактивные виджеты — главный moat

Code playground и Figma-embed — минимум. Настоящая ценность — widgets никто в русскоязычном сегменте не делает:

**v1 (MVP, 5 виджетов):**
1. **Hierarchy reorder** — 5 элементов, drag-reorder, F-pattern heatmap "как глаз читает"
2. **Color contrast sandbox** — fg/bg picker, WCAG AA/AAA + APCA + превью
3. **Type pairing lab** — 2 шрифта из Google Fonts API, оценка пары по эвристикам
4. **Spacing tuner** — слайдер padding/margin/gap, оценка близости к "правильному"
5. **A11y simulator** — симуляция дальтонизма, blur, screen-reader rail

**v2 (ещё 9):**

6. Before/after slider с annotation layer
7. Critique mode — пины с комментариями, сравнение со story автора
8. Component state explorer — button→все состояния + CSS
9. Principle-checker — bounding-boxes выделяют нарушения alignment
10. Flow builder — drag-drop user flow, проверка эвристик
11. Figma→code — JSON токены, CSS переменные, handoff
12. Live WCAG-check в playground — контраст подсвечивается по ходу
13. Motion-curve editor — bezier, превью анимации
14. Grid builder — columns/gutter/margin, снепшоты

### Техническая реализация

Все widgets — React components, lazy-loaded через `dynamic(..., { ssr: false })` + IntersectionObserver.

Каждый widget имеет `<WidgetName data={...} />` интерфейс, данные из MDX frontmatter:

```mdx
<HierarchyReorder
  items={["h1", "eyebrow", "body", "cta", "caption"]}
  solution={["eyebrow", "h1", "body", "cta", "caption"]}
  hint="Подумай об F-паттерне"
/>
```

---

## 8. Технический стек

- **Framework**: Next.js 16 (App Router), TypeScript strict
- **Styling**: Tailwind v4, `@custom-variant dark`, next-themes
- **Components**: shadcn/ui, Base UI, custom icon library "Marks"
- **DB**: PostgreSQL (Neon), Prisma 6, миграции через `prisma migrate`
- **Auth**: next-auth v4 (**план миграции на Auth.js v5 в первые 6 мес**)
- **AI**: Vercel AI SDK v5 + OpenRouter (gemini-flash для chat, claude-sonnet для submission feedback)
- **AI Gateway**: Vercel AI Gateway с hard daily cap $10
- **Content**: MDX + Fumadocs + `remark-directive` + Zod-валидируемый frontmatter
- **Code editor**: CodeMirror 6 + `srcdoc` iframe (не Sandpack)
- **Images**: Vercel Blob (signed PUT), SVG проходят через DOMPurify
- **i18n**: `next-intl@^3`, `content/lessons/<locale>/<track>/`
- **Deploy**: Vercel, Neon Launch tier ($19/мес) до public launch
- **Analytics**: Plausible (not Google) или Vercel Analytics

---

## 9. Архитектура контент-пайплайна

### Почему не runtime Markdown (как в референсе)

1. **Cold start**: 100+ файлов × 5KB × gray-matter на каждом свежем Lambda = 500-900мс к TTFB. Недопустимо.
2. **Bundle inclusion**: `fs.readdirSync(process.cwd() + "/content")` работает на Vercel "по случайности" — один рефакторинг пути и контент исчезает из билда.
3. **Нет интерактивных компонентов**: нельзя `<Playground />` в `.md`.

### Решение: MDX + Fumadocs

- **`@next/mdx@^16`** + **`fumadocs-mdx@^12`** — collection / валидация layer (Fumadocs активнее maintained чем Contentlayer2)
- **Zod schema** валидирует frontmatter на load time, Fumadocs генерирует `.source/` типы — autocomplete и compile-time ошибки вместо runtime blow-ups
- **`remark-directive`** для кастомных shortcodes (`:::figma{url=...}`, `:::compare{before=...}`), чтобы content authors не eject-или к JSX
- **Interactive React components** — через MDX `components` prop в topic page

### Файловая структура

```
content/
  lessons/
    ru/
      foundations/
        typography/
          index.mdx              # frontmatter + раздел overview
          01-anatomy.mdx
          02-hierarchy.mdx
          03-pairings.mdx
    en/
      foundations/
        typography/
          index.mdx
          01-anatomy.mdx
  rubrics/
    hierarchy-basic.yaml
  assets/
    rubric-examples/
      hierarchy-5.png
```

`source.ts` (Fumadocs) возвращает `getLessons({ locale })`.

**Критично**: `translations: ["en"]` в frontmatter декларирует какие локали существуют — никаких silent 404s. Фоллбек: "Перевод скоро".

### Zod-схема frontmatter

```ts
const topicSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().positive(),
  blooms_level: z.enum(["L1", "L2", "L3", "L4", "L5"]),
  estimated_minutes: z.number().int().min(1).max(180),
  requires: z.array(z.string()).optional(),
  rubric_id: z.string().optional(),
  exercise_types: z.array(z.enum(["knowledge_check", "reorder", "spot_diff", "critique", "redesign"])).optional(),
  translations: z.array(z.enum(["ru", "en"])).optional(),
});
```

---

## 10. Database schema — изменения от референса

```prisma
enum Track {
  FOUNDATIONS
  INTERFACE
  EXPERIENCE
  CRAFT
}

enum BloomsLevel { L1 L2 L3 L4 L5 }

enum SubmissionStatus {
  PENDING            // AI feedback in flight
  FEEDBACK_READY
  FEEDBACK_FAILED    // retry-able
  ARCHIVED
}

enum ChatMessageStatus {
  PENDING
  STREAMING
  COMPLETE
  FAILED
}

model User {
  // ... same as reference, но:
  preferredTrack    Track?
  preferredLevel    BloomsLevel?
  currentStreak     Int     @default(0)
  longestStreak     Int     @default(0)
  lastStreakDay     DateTime?
  // ...
}

model UserProgress {
  id          String       @id @default(cuid())
  userId      String
  lessonSlug  String
  topicSlug   String
  track       Track        // DENORMALIZED
  level       BloomsLevel  // DENORMALIZED
  completed   Boolean      @default(false)
  completedAt DateTime?
  createdAt   DateTime     @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonSlug, topicSlug])
  @@index([userId, track])           // "my UI progress"
  @@index([track, completed])        // "how many completed UI"
  @@index([userId, completedAt])     // activity stream
  @@map("user_progress")
}

model ChatMessage {
  id          String            @id @default(cuid())
  userId      String
  lessonSlug  String
  topicSlug   String
  role        String
  content     String            @db.Text
  status      ChatMessageStatus @default(COMPLETE)
  createdAt   DateTime          @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, lessonSlug, topicSlug, createdAt(sort: Desc)])
}

model Submission {
  id             String           @id @default(cuid())
  userId         String
  topicSlug      String
  lessonSlug     String
  figmaUrl       String?
  imageUrl       String?
  description    String           @db.Text
  feedback       String?          @db.Text
  status         SubmissionStatus @default(PENDING)
  feedbackModel  String?
  feedbackTokens Int?
  retryCount     Int              @default(0)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([status, createdAt])   // retry worker
  @@map("submissions")
}

model Rubric {
  id         String            @id
  dimensions RubricDimension[]
}

model RubricDimension {
  id       String @id @default(cuid())
  rubricId String
  key      String
  label    String
  weight   Float
  levels   Json     // { 1: "...", 3: "...", 5: "..." }
  rubric   Rubric   @relation(fields: [rubricId], references: [id])
}

model ReviewQueue {
  id         String   @id @default(cuid())
  userId     String
  topicSlug  String
  dueAt      DateTime
  strength   Int      @default(0)  // spaced-repetition strength
  @@index([userId, dueAt])
}

model LearningPath {
  id       String     @id @default(cuid())
  slug     String     @unique
  title    String
  steps    PathStep[]
}

model PathStep {
  id      String        @id @default(cuid())
  pathId  String
  order   Int
  topicSlug String
  path    LearningPath  @relation(fields: [pathId], references: [id])
}

model PlaygroundSnapshot {
  id         String   @id @default(cuid())
  userId     String
  topicSlug  String
  html       String   @db.Text
  css        String   @db.Text
  js         String   @db.Text
  updatedAt  DateTime @updatedAt
  @@unique([userId, topicSlug])
}

model AdminAuditLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String
  targetId  String?
  metadata  Json?
  createdAt DateTime @default(now())
  @@index([adminId, createdAt])
}

model ErrorReport {
  // ... как в референсе, но с индексами:
  @@index([resolved, createdAt])
  @@index([lessonSlug])
}
```

**Migration discipline**:
- `prisma migrate` (не `db:push`), commit `.sql` с первого дня
- Never delete `.md` файл — `published: false` вместо этого; content validator в CI блокирует удаления
- Content referential integrity check в nightly CI против read-only DB replica

---

## 11. AI chat — фикс bug'а референса

Баг: в `src/app/api/chat/route.ts` референса user message пишется в DB **до** стрима. Если стрим падает — orphaned user turn в истории.

### Фикс в три части

**(a) Транзакция + PENDING статус:**

```ts
const [userMsg, assistantMsg] = await db.$transaction([
  db.chatMessage.create({ data: { ..., role: "user", status: "COMPLETE" } }),
  db.chatMessage.create({ data: { ..., role: "assistant", content: "", status: "PENDING" } }),
]);
```

GET-фильтр исключает `PENDING | FAILED` из истории. Nightly sweep удаляет orphaned PENDING > 2 мин.

**(b) `cancel()` handler для client-disconnect:**

```ts
const readableStream = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of stream) { /* accumulate */ }
      await db.chatMessage.update({ where: { id: assistantMsg.id }, data: { content, status: "COMPLETE" } });
      controller.close();
    } catch (error) {
      await db.chatMessage.update({ where: { id: assistantMsg.id }, data: { content: partial, status: partial ? "COMPLETE" : "FAILED" } });
      controller.error(error);
    }
  },
  async cancel() {
    // Client disconnected — сохраняем что успели
    await db.chatMessage.update({ where: { id: assistantMsg.id }, data: { content: partial, status: partial ? "COMPLETE" : "FAILED" } });
  },
});
```

**(c) Миграция на Vercel AI SDK v5** — убирает ~80 строк hand-rolled SSE, даёт `useChat` hook на клиенте.

### Остальное по chat

- **Per-user rate limit**: `rateLimit("chat:" + userId, 20, 60_000)`
- **Per-track system prompts**: `tutorPersona[Track]`
- **Context window management**: tiktoken, trim до 75% модельного контекста
- **Hard cost ceiling**: `max_tokens: 800`, daily per-user cap 100, `gemini-flash-1.5` для chat, `claude-sonnet` только для Submission feedback
- **`ChatUsage` table**: prompt_tokens + completion_tokens для weekly cost report

---

## 12. Performance budget

### Lighthouse CI (`@lhci/cli`) gating PRs

| Metric | Home | Track | Topic | Admin |
|---|---|---|---|---|
| Performance | ≥95 | ≥92 | ≥88 | ≥80 |
| Accessibility | ≥98 | ≥98 | ≥98 | ≥95 |
| Best Practices | ≥95 | ≥95 | ≥95 | ≥90 |
| FCP | ≤1.2s | ≤1.5s | ≤1.8s | ≤2s |
| LCP | ≤2.0s | ≤2.2s | ≤2.5s | ≤3s |
| CLS | ≤0.05 | ≤0.05 | ≤0.1 | ≤0.1 |
| INP | ≤200ms | ≤200ms | ≤200ms | ≤300ms |

Mobile emulation: Moto G4 / 4G. **Fail PR на регрессе**, не warn.

### Bundle size (gzipped, per route)

- `/` — ≤90 KB JS initial
- `/lessons` — ≤100 KB
- `/lessons/[track]/[lesson]/[topic]` (без playground) — ≤140 KB
- `/lessons/[track]/[lesson]/[topic]` (с playground loaded) — ≤240 KB

Энфорс через `size-limit@^11`.

### Heavy offenders — стратегия

- Playground → `dynamic({ ssr: false })` + IntersectionObserver 200px до viewport
- Figma embeds → `<iframe loading="lazy">` + static thumbnail placeholder до intersection
- `react-markdown` → не нужен (MDX компилит в JSX на build)
- OG-image gen → `runtime="edge"`

---

## 13. Accessibility — экзистенциальный тест для дизайн-школы

### CI gating

- **`@axe-core/playwright`** на каждом route — fail на `critical | serious`
- **Pa11y-CI** в nightly — ловит то, что axe пропускает (focus order после modal)
- **Storybook addon-a11y** на каждом component story

### Keyboard specs для widgets

- Color picker: arrow keys nudge HSL (step 1, shift+arrow step 10); tab H→S→L
- Type specimen: native `<input type="range">` с `aria-valuetext="16 пикселей"`
- Playground: CM6 keyboard; trap-escape (tab = tab внутри, Esc+tab = выйти)
- Before/after slider: ArrowLeft/Right в 5%; `role="slider"`
- Figma embed: `<figure><figcaption>`, "скачать PDF" fallback для screen-reader users

### Contrast guarantees

Референс имел critical dark-mode CSS bug. Предотвращение:

1. **Tokens в OKLCH**, не HSL — perceptually uniform
2. **Contrast audit script** в CI — `@adobe/leonardo-contrast-colors`, читает `globals.css`, проверяет каждую пару `foreground-*` / `background-*` ≥ 4.5:1 (body) / 3:1 (large) в **обоих** режимах
3. **Playwright visual regression** — скриншоты обоих тем; unexpected diff блокирует PR
4. Ни одного решения "на глаз"

---

## 14. Motion language

Принцип: **motion читается как бумага, отвечающая на касание**, не как software animating.

### Правила

- **Единственная кривая**: `cubic-bezier(0.2, 0.0, 0.1, 1.0)` ("paper ease"). Никакого bounce.
- **Три durations**: 120мс (micro — hover/focus), 240мс (small — tooltips/inline), 480мс (page/modal entry). Выше 480мс — только user-controlled sequences.
- **Distance**: всегда fraction of the grid — 4px или 8px, не 20px. Gentle.

### Micro-interactions, которые обучают

- Progress meter на теме = **baseline-aligned rule 0.5px** growing left→right по скроллу. Прогресс continuous с страницей, не "bar above it".
- Completion = F·F mark в шапке briefly ligates (dot → full crossbar). 320мс. Никакого конфетти.
- Hover на code block → underlines matching line в preview iframe (cinnabar 1px). Учит соответствию.
- Read/unread на topic list: unread — ink; read — fade к 40% ink за 400мс.

### Запрет

- Parallax, scroll-jacking
- Reveal-on-scroll для декорации (только если reveal = урок)
- Hover transforms на images/cards. Cards не кнопки.
- Shimmer skeleton loaders. Статичные grey rules.
- Lottie, кроме явно-педагогических в уроках про motion.

**Тест**: уберите всю анимацию — работает? Должно работать. Motion — amplifier.

---

## 15. Dark mode — "Студия"

Не secondary, не "инверсия". Отдельная личность.

- Концепт: light = **printed book**; dark = **studio at night** — дизайнер работает поздно, приглушённая комната, экран как единственный свет. В UI settings — **«Студия»**.
- Background `#16130E` — очень тёмный brown, warmth preserved
- Body text `#ECE6D8` — cream, не white
- Cinnabar shifts к warmer/brighter (`#E8604D`), ≤6% пикселей
- Rules `#2A2722`, остаются 0.5px
- Images в dark-mode — global luminance filter -2%, чтобы full-bleed исторические репродукции не кричали
- **Body по умолчанию — italic** (Newsreader italic) — handwritten, intimate, studio register. Nobody is doing this. Toggle для юзеров, предпочитающих roman.

---

## 16. Layout: 16-колонник с Tuftean margin notes

### Grid

- Desktop (≥1280): **16 cols**, 24px gutter, 80px outer margin
- Topic page default: content в cols 3-10 (8 cols), margin-notes в cols 12-15 (4 cols), col 11 = breathing gutter. Эдвард Тафт convention, не "sidebar".
- Tablet (768-1279): 8 cols, content 1-6, notes в 7-8 или inline
- Mobile: single column, margin notes inline с hairline rule

### Baseline и scale

- **Baseline 8px** — всё вертикальное snappit
- Body leading 24px (3×8)
- **Модульная шкала**: 1.25 (major third) для body ladder, 1.414 (√2) для display ladder
- **Reading measure 62 characters** — non-negotiable. Long-form = ~620-680px column, остальное — поля. Поля — это страница.

### Break the grid

- Start of lesson section: full-bleed hero, no grid
- Pull quotes (Rams/Munari/Tschichold/Lissitzky): в поле, italic serif, oversized opening quote как ghost character позади текста
- End-of-topic synthesis: full-bleed cinnabar band. Один на тему. Earned.

### Pacing devices для 2000-слов-урока

- Drop cap первого параграфа (serif, 3 lines, cinnabar)
- Small-caps breaks с dinkus (`· · ·`)
- Margin notes: термины/даты/cross-refs — eye leaves column, rests, returns
- Диаграммы-breathers каждые ~400 слов. Load-bearing.
- "Try this" блоки каждые ~600 слов. Ochre rules above/below.

Reference: Bringhurst *Elements*, Lupton *Thinking with Type*, Müller-Brockmann *Grid Systems*.

---

## 17. Retention и комьюнити

### v1 (низкая стоимость)

1. **Streaks** — ежедневная галочка (quiz solved / topic opened). Duolingo-эффект работает.
2. **Weekly digest email** — "ты прошёл X, впереди Y, вот интересный кейс".
3. **Public submissions gallery (opt-in)** — огромный motivational hook; студенты хотят "в витрину".
4. **Like/save** на чужих submissions.
5. **Monthly design challenge** — одна задача, дедлайн, топ-10 на главной.

### Mid-term (v2)

6. Cohorts (по 30 чел., sync chat room, peer-review)
7. Critique circles (4 чел./неделю, SBI format)
8. Monthly office hours с экспертом
9. Mentor-badge для completed-tracks юзеров (gamification + free labor)

### Retention-механики, доказанные в edtech

- Spaced notifications (`ReviewQueue`)
- Loss aversion: "streak сгорит через 6 часов"
- Social proof: "34 человека изучают эту тему"
- Progress visibility: "47/150 done, next milestone at 50"

---

## 18. Доступ

**Продукт полностью бесплатен.** Все треки, упражнения, widgets, AI-чат, AI-грейдинг submissions, портфолио-генератор — без оплаты, без paywall, без регистрации wall. Регистрация нужна только для трекинга прогресса и submissions.

### Лимиты для защиты от злоупотреблений (не монетизация)

- AI chat: 50 msg/день на пользователя (достаточно с запасом для обучения)
- Submission AI feedback: 10 в день
- Account cap: обычный rate-limit

Цель: обучение, не экономика. Инфраструктурные расходы покрываются из кармана, с hard cap на AI ($10/день) и мониторингом.

---

## 19. Copy-from-reference стратегия

**Не git subtree. Не shared package. Date-stamped clean copy.**

- `docs/SNAPSHOT.md` с точным commit SHA diabolus-in-musica откуда скопировали (сейчас: `d964637`)
- `docs/drift/` — diff каждого модифицированного файла
- GitHub subscription на diabolus security-label PRs
- `make diff-upstream` скрипт: `git diff <sha>..diabolus/main -- src/lib/` — квартальный eyeball
- Divergence — осознанный выбор, не случайность

### Что копируем

**1:1** (с SNAPSHOT):
- `src/lib/rate-limit.ts` (с планом миграции на Upstash Redis до public launch)
- `src/lib/db.ts`
- `src/components/ui/` (shadcn)
- `src/app/api/auth/` (с планом миграции на Auth.js v5 в 6 мес)
- Configs: `next.config.ts`, `tsconfig.json`, `eslint`
- `middleware.ts` → после copy запустить `@next/codemod middleware-to-proxy` для Next 16

**С правками:**
- `prisma/schema.prisma` (полная переработка см. §10)
- `src/lib/auth.ts` (`preferredInstrument` → `preferredTrack`, новый JWT shape)
- `src/lib/content.ts` → **заменить полностью** на Fumadocs-based loader
- `src/app/(auth)/onboarding/page.tsx` (Track вместо Instrument)
- `src/app/api/user/preferences/route.ts` (Track)
- `src/app/(public)/lessons/*` (новый дизайн, см. §20)
- `src/app/admin/*` (только брендированные tweaks)

**Пишем с нуля:**
- Всё в `content/`
- Весь визуал: `Logo`, `Footer`, `globals.css`, token system
- Custom icon library "Marks"
- Interactive widgets (§7)

---

## 20. Конкретные mockup-direction-ы

### 20.1 Homepage hero

- Full-width 80vh band, paper fon
- Cols 3-14: wordmark `forma et functio` display-xl 96px Newsreader regular, cinnabar `et` italic
- Below: 0.5px hairline full measure
- Cols 3-10: одно предложение в serif 19px black: *«Учебник цифрового дизайна — с примерами, которые работают в браузере.»*
- Cols 12-15: вертикальный стек 4 tiny captions 13px sans smallcaps: `65 разделов · 4 трека · Живые примеры · На русском`. Numerals в tabular, cinnabar.
- **No button**. Page continues past fold.
- First track row starts at 100vh exactly — fold = deliberate turn.

Below fold: **4-row horizontal grid of tracks**, full-bleed rows (не card grid), track-title display-m + 3-line serif description + color-strip 4px left edge. Hover → thin cinnabar underline под title. Homepage — это table of contents, не app store.

### 20.2 Track page

- H1 display-l в cols 3-12 + hairline + manifesto body-l serif
- Cols 13-15: маленькая axonometric diagram структуры трека — граф зависимостей уроков. Real diagram, не decoration.
- Ниже: **numbered list, not cards**:
  - Col 3: tabular lining figure 22px mono (номер урока)
  - Col 4-9: h3 title + body-s one-line description
  - Col 10-11: `14 мин · L3` в 13px smallcaps
  - Col 13-15: tiny progress rule 0.5px cinnabar
  - Hover: background `#EDE7DB` (half-step off paper), больше ничего

### 20.3 Topic page — three-band

**Band A (hero)**: full-bleed, 60vh min. Canonical image топика (historical / specimen / diagram). Bottom-left 13px smallcaps: `Трек INTERFACE · Раздел 04 · Тема 03 · 14 мин`. Top-right: F·F mark → home.

**Band B (reading)**:
- Cols 3-10: body serif 17/28
- Cols 12-15: margin notes — термины, даты, cross-refs — italic serif 13px, hairlines между
- Drop cap первого параграфа
- Section breaks: small-caps (`§ 01 · ПРОПОРЦИИ`)
- Interactive components inline at full main-column width, preceded by ochre rule, labelled `Упражнение` smallcaps. После — снова ochre rule, reading resumes.

**Band C (synthesis)**: full-bleed cinnabar band в конце, paper-coloured text. Summary display-m, key takeaways в 19px serif, next-topic link h3. Cinnabar band — **earned**, закрывает тему как colophon.

### 20.4 Onboarding — 4 экрана, без progress bar

Не funnel. **Invitation into a studio**.

- **Screen 1 — welcome**: full-screen wordmark display-xl. One sentence below. Optional name input. Quiet button `Войти →`, 13px mono, cinnabar underline on hover only.
- **Screen 2 — track**: 4 row-buttons как на homepage. Selection = selection, no "next". Single hairline animates под selected.
- **Screen 3 — level**: три опции как **specimens типографики** — `beginner` 22px, `intermediate` 40px, `advanced` 68px. Self-referential: форма учит scale.
- **Screen 4 — goal**: textarea с hairline, prompt italic serif: *«Что вы хотите научиться делать?»*. Typing encouraged but optional. Button `Начать чтение →`.

30 seconds. Feels like turning pages.

---

## 21. Testing strategy

Референс тестов не имеет. Для платного edtech — обязательно.

| Tool | Version | Что тестирует | ROI |
|---|---|---|---|
| **Vitest** | `^2` | Pure functions (content loader, zod, tokenizer, rate-limit) | Highest |
| **Playwright** | `^1.48` | E2E: login → onboarding → complete topic → chat | Highest |
| **`@axe-core/playwright`** | `^4` | A11y violations per route | High |
| **Storybook** | `^8` | Components isolation, visual regression (Chromatic) | Medium |
| **Prisma integration** | via vitest + Testcontainers | Migrations + query correctness | Medium |

### Что тестируем

1. **Content integrity** — load every lesson, assert Zod valid, unique `order` within lesson, no duplicate slugs, all referenced images exist, internal links resolve
2. **Auth flow** — register → cookie → onboarding → protected route → logout → redirect
3. **Topic completion** — scroll → mark complete → refresh → progress persists
4. **Chat** — mocked OpenRouter (MSW); user+assistant persist; inject 500 → dangling user NOT visible on reload (regression for bug fix §11)
5. **Admin guardrails** — non-admin blocked from `/admin/*`, admin cannot escalate others

### CI pipeline

```yaml
jobs:
  lint:    # eslint + tsc --noEmit        ~30s
  unit:    # vitest                         ~20s
  e2e:     # playwright vs preview URL      ~3 min
  a11y:    # axe + pa11y vs preview         ~2 min
  lhci:    # lighthouse-ci vs preview       ~4 min
  size:    # size-limit                     ~30s
```

PR не мержится если любой job fail.

---

## 22. Developer experience

### Content authors (non-engineers)

**Option A (рекомендую)**: GitHub web editor + PR preview.
- Один designer учится делать PR прямо в github.com
- Vercel preview за 90 сек
- GitHub Actions бот постит preview URL + список изменённых уроков
- `CONTENT.md` с frontmatter spec + примерами

**Option B**: Keystatic или TinaCMS поверх `content/` — при 3+ авторах.

### Local dev one-liner

```bash
pnpm install && pnpm db:setup && pnpm dev
```

`db:setup` = `docker compose up -d postgres && prisma migrate deploy && prisma db seed`. Docker Postgres 16 локально — мгновенно, без Neon-branching-wait.

Альтернатива: Neon branching + `.env.local.<branch>` — каждому dev свой DB branch на free tier.

---

## 23. Фазы имплементации

### Фаза 0 — Pre-content (5 инженер-дней, критично сделать ДО контента)

- [ ] Init Next.js 16 + TS strict + pnpm + Docker Postgres
- [ ] `SNAPSHOT.md` с текущим diabolus commit SHA + `make diff-upstream`
- [ ] Copy выбранные files с rename (см. §19)
- [ ] Tailwind v4 + design tokens в OKLCH + Newsreader/Inter Display шрифты
- [ ] Prisma schema (§10) + initial migration
- [ ] MDX + Fumadocs + Zod frontmatter (§9)
- [ ] CI: Lighthouse CI + axe + size-limit + Playwright — с gating на PR
- [ ] CSP header настроен, tightened
- [ ] Rate limiter migration план (Upstash) → документ
- [ ] AI Gateway hard daily cap $10

### Фаза 1 — Core UI (5 дней)

- [ ] `globals.css` с полной палитрой (light + dark "Студия")
- [ ] Logo (F·F ligature) + wordmark
- [ ] Custom icon library "Marks" — 30 иконок
- [ ] 16-col grid system, typography scale, baseline
- [ ] Homepage hero + track list (editorial, not cards)
- [ ] Track page (numbered rows, axonometric graph)
- [ ] Topic page (three-band: hero / reading+margin notes / synthesis)
- [ ] Onboarding (4 screens, page-turning feel)
- [ ] Motion language (1 easing curve, 3 durations)

### Фаза 2 — 1 полный урок со всей педагогикой (3 дня)

**Не делаем админку до этого момента**, чтобы не построить красивый пустой контейнер.

- [ ] "Типографика: анатомия" полностью:
  - Hero (specimen or diagram)
  - 2000 слов body в MDX
  - Margin notes
  - 2 knowledge checks (inline `:::quiz`)
  - 1 reorder exercise (drag-n-drop widget)
  - 1 redesign submission (AI feedback через rubric)
  - Synthesis band
  - Completion → streak+1, F·F mark ligates
- [ ] Rubric `hierarchy-basic.yaml` с reference examples
- [ ] Submission flow с PENDING → FEEDBACK_READY pipeline

Это **dogfood-urok**. Все дальнейшие — по этому шаблону.

### Фаза 3 — Interactive widgets v1 (3 дня)

- [ ] Hierarchy reorder
- [ ] Color contrast sandbox
- [ ] Type pairing lab
- [ ] Spacing tuner
- [ ] A11y simulator

Lazy-loaded (`dynamic(ssr:false)` + IntersectionObserver), с keyboard support по §13.

### Фаза 4 — Chat + retention (2 дня)

- [ ] AI SDK v5 migration
- [ ] Chat bug fix (§11, все три части)
- [ ] Streaks + daily digest
- [ ] Public submissions gallery (opt-in)

### Фаза 5 — Admin (2 дня)

- [ ] Только брендированные правки существующих страниц:
  - /admin (обзор со stats)
  - /admin/users
  - /admin/submissions (review queue)
  - /admin/error-reports
  - /admin/content (переводы parity)
- [ ] AdminAuditLog на каждое admin-действие

### Фаза 6 — Контент (постоянно, параллельно)

- [ ] FOUNDATIONS: 15 тем
- [ ] INTERFACE: 25 тем
- [ ] EXPERIENCE: 15 тем
- [ ] CRAFT: 10 тем

**Реализм**: 1 качественная тема = 1 день работы эксперта. 65 тем = 13 недель full-time одного автора. План авторов нужен.

### Фаза 7 — Launch

- [ ] Neon Launch tier (на случай роста нагрузки)
- [ ] Monthly design challenge kick-off
- [ ] Plausible analytics
- [ ] SEO: per-трек, per-раздел, per-тема meta + OG images (edge runtime)
- [ ] Custom domain
- [ ] Public launch

---

## 24. Критерии готовности v1

- [ ] 65+ тем опубликованы (FOUND: 15, INT: 25, EXP: 15, CRAFT: 10)
- [ ] 5 интерактивных widgets работают во всех релевантных темах
- [ ] AI-грейдинг с rubric на ≥20 submissions-упражнениях
- [ ] Streaks + daily digest email
- [ ] Public submissions gallery с opt-in
- [ ] Monthly design challenge page
- [ ] Dark mode "Студия" полноценный, не инверсия
- [ ] Lighthouse ≥95 (home) / ≥88 (topic с playground) mobile
- [ ] Axe CI зелёный на всех routes
- [ ] 5 Playwright e2e tests покрывают critical path
- [ ] CSP tightened, nonce-based script-src в prod
- [ ] Admin audit log пишется

---

## 25. Технические риски

| # | Риск | Сценарий | Митигация |
|---|---|---|---|
| 1 | **AI cost spike** | Viral tweet, 10k × 20msg × 2k tokens = $200-2000/день | AI Gateway hard cap $10/день, per-user daily limit 100, max_tokens 800, CAPTCHA на register после 100 signups/hr из одной страны |
| 2 | **Neon free tier** | 0.5GB + auto-suspend = 500+ мс cold start | Neon Launch $19/мес до launch, prune ChatMessage > 90 дней, `@neondatabase/serverless` + pgbouncer |
| 3 | **Content divergence RU↔EN** | 30 EN переведено, RU добавил 5, силент 404 на 10% страниц | `translations` в frontmatter, CI assert parity, translation-status дашборд `/admin/i18n`, weekly digest |
| 4 | **next-auth v4 CVE** | v4 в maintenance-only | Migration plan на Auth.js v5 в первые 6 мес, не шипим новых auth-фич на v4 |
| 5 | **XSS через user markdown** | Submission.description как HTML | `rehype-sanitize` с restricted schema (no iframe/script/on*), SVG через DOMPurify |
| 6 | **Admin impersonation** | role-based checks scattered | `AdminAuditLog` на каждое действие + PR review на новых admin-ендпойнтах |
| 7 | **Content-автор burnout** | Один человек пишет 65 уроков = 13 недель | План: 3 автора × 22 темы; хотя бы 2 наняты до Фазы 6 |
| 8 | **Skillbox маркетинг** | У конкурентов бюджет | SEO на long-tail ("OKLCH в CSS", "spacing в Figma"), качество widgets как PR-hook |

---

## 26. Открытые вопросы для решения

- **i18n таймлайн**: RU-launch в v1, EN — Q2?
- **Сертификация**: добавлять PDF-сертификат в v2 или остаться на portfolio-only?
- **Peer review**: включать в v2 как дополнение к AI, или AI-only навсегда?
- **Cohorts**: запускать как "beta batch" через 3 месяца после launch или только когда MAU > 1000?
- **Offline-доступ**: PWA с service worker для чтения оффлайн в v2?

---

## 27. Приоритет №1: что сделать в следующий раз когда сядешь

Из 10-item action list фронтендера — первые 3, потому что они всё остальное разблокируют:

1. **Bootstrap Next.js 16 + MDX + Fumadocs + Zod frontmatter validation** (1 день)
2. **Prisma schema из §10 + первая миграция** (1 час)
3. **Написать 1 полный урок** (Типографика: анатомия) с hero, MDX, quiz, reorder, rubric-submission — это работающий proof-of-concept для всей педагогики

Только после этого — визуальная полировка, админка, остальные widgets.

---

**Общий бюджет до public launch**: ~8 инженер-недель + 13 недель content-авторства (параллельно с фазой 4+). Realistic MVP таймлайн: **3-4 месяца**.

*План синтезирован из трёх экспертных ревью, см. `docs/reviews/`.*
