# Designer Review — Forma et Functio

*Reviewer: Senior Product Designer, 15 лет опыта (FAANG, Designlab, IxDN). Review date: апрель 2026.*

---

## TL;DR

План — это **инженерный** чертёж курса, а не **педагогический**. Архитектура данных продумана, но обучающая часть опирается на наивное предположение «напишем 40 уроков — юзер выучится». Это не так. 40 тем в 4 треках дают в среднем 10 тем на роль — это меньше, чем один семестр Designlab UX Academy, и в 3–5 раз меньше, чем курсы IDF. Без системы повторений, упражнений и критики вся эта инфраструктура превратится в набор хорошо свёрстанных статей с AI-чатом сбоку, которые юзер прочитает один раз и забудет.

Ниже — конкретные правки.

---

## 1. Педагогика: что сломано в идее «40 уроков»

### 40 тем — это демо, не курс

Для сравнения: **Interaction Design Foundation** предлагает ~40 курсов, в каждом 6–12 модулей, каждый модуль 3–8 уроков. Итого ~1500 единиц контента. **Designlab UX Academy** — 480 часов за 15 недель. **Google UX Certificate** — 7 курсов, ~200 часов. Наши 40 тем при средней длине 15 минут — это 10 часов контента. Это блог, а не школа.

**Реалистичная цель v1**: 12 lesson-разделов × 5 тем × 20 минут = **20 часов базы**. Это MVP. Дальше разворачивать до ~200 тем за год.

### Чего нет в плане и без чего дизайнер не учится

1. **Spaced repetition / повторения.** Дизайн-знания без повторения живут 2 недели. Нужна система: «через 7 дней — флэшкарта по Гештальту», «через 21 день — применить в упражнении». Anki-like mechanic, можно простую: `ReviewQueue` таблица + ежедневный digest.
2. **Worked examples → faded examples → independent practice.** Классическая когнитивная прогрессия (Sweller, 1988). План даёт только теорию + submission. Между ними нужен мостик: разбираем чужой дизайн → повторяем с подсказками → делаем сами.
3. **Prerequisites / deps graph.** «Типографика» в GENERAL #6 идёт до «CSS-основ» в FRONTEND #32 — но `line-height`, `font-size: rem/em` и vertical rhythm невозможно объяснить без CSS. Нужен явный граф зависимостей в frontmatter:
   ```yaml
   requires: ["general/typography-anatomy", "frontend/css-units"]
   ```
   И блокировка (или хотя бы warning) на UI.
4. **Critique как первоклассный навык.** Критика — это 50% работы дизайнера. В плане её нет вообще. Нужен отдельный тип упражнения «напиши критику этого лендинга», с rubric.
5. **Transfer.** Знание «principle of proximity» ≠ умение применять его. Нужны **cross-context exercises**: «вот 5 разных UI — где нарушена близость?».

### Иерархия уровней сырая

`beginner/intermediate/advanced` — слишком крупно. Предлагаю bloom-like:
- **L1 Recognize** (узнать: «это serif»)
- **L2 Recall** (назвать: «это Didone, высокий контраст штрихов»)
- **L3 Apply** (применить: «подбери шрифт для finance-дашборда»)
- **L4 Analyze** (разобрать: «почему типографика Stripe работает?»)
- **L5 Create** (создать: «разработай type system для e-commerce»)

Каждая тема должна иметь явный target level. Это критично для AI-грейдинга (см. §4).

---

## 2. Структура треков: 6 — неправильное число

### Что не так

**BRAND и GRAPHIC** в веб-курсе — лишнее. Если цель — web-design education (а судя по стеку, это оно), то брендинг нужен максимум как вспомогательный. Иначе вы конкурируете с Skillbox / Bang Bang Education на их поле, где они сильнее.

**PRODUCT и UX пересекаются на 70%.** Discovery, метрики, A/B, research — всё это UX. Разделение product/UX — корпоративная политика FAANG, а не педагогика. В обучении это путает.

**FRONTEND** — правильно, но должен быть **meta-треком**, а не параллельным. Дизайнер не учит React отдельно от компонентов; он учит Flexbox **когда** делает auto-layout в Figma. Frontend-темы должны быть вкраплены в UI-track, а не висеть отдельным столбиком.

### Мой вариант — 4 трека вместо 6

| ID | Название | Суть | ~тем v1 |
|----|----------|------|---------|
| `FOUNDATIONS` | Основы | Перцепция, композиция, цвет, типографика, grid. Обязательно для всех. | 30 |
| `INTERFACE` | Интерфейсы | UI-паттерны, компоненты, state, системы, HTML/CSS как tool. | 50 |
| `EXPERIENCE` | Опыт и исследования | Research, IA, flows, тестирование, метрики, A/B, accessibility. | 40 |
| `CRAFT` | Ремесло | Motion, микроинтеракции, data viz, prototyping, design ops, портфолио. | 30 |

Итого 150 тем как цель. BRAND → 3–5 тем внутри FOUNDATIONS (brand-expression как применение типографики и цвета). FRONTEND → распределить по INTERFACE и CRAFT.

### Как учатся реальные дизайнеры

Не по трекам. По **проектам**. Поэтому поверх треков нужны **learning paths** — сквозные сценарии:
- «Я делаю первый мобильный лендинг» (20 тем из разных треков, упорядочены)
- «Редизайн SaaS-дашборда» (30 тем)
- «Запуск design system с нуля» (25 тем)

Это UX-killer-фича: юзер не выбирает трек, он выбирает **цель**, и система собирает ему путь.

---

## 3. Подробный контент-outline

Ниже — outline для 4 треков, каждый раздел = lesson-директория, каждый пункт = topic. Формат: **раздел** → темы.

### FOUNDATIONS (30 тем)

1. **Что такое дизайн** — история от Bauhaus до digital; роль дизайнера; функция vs декорация; кейс: эволюция iPhone settings 2007→2024.
2. **Перцепция и гештальт** — близость, сходство, замыкание, continuity, figure/ground, common fate; упражнение «перегруппируй карточки».
3. **Визуальная иерархия** — размер, вес, цвет, позиция, whitespace; упражнение «расставь приоритеты на лендинге».
4. **Композиция и сетки** — rule of thirds, golden ratio (и почему это миф в UI), 8pt grid, baseline grid, columns; разбор: Swiss posters vs Apple.com.
5. **Цвет: теория** — circle, complementary/analogous/triadic/tetradic, tints/shades/tones; интерактив: крути колесо.
6. **Цвет: системы** — RGB, HSL, LCH, OKLCH; почему OKLCH лучше для accessible палитр; perceptual uniformity.
7. **Цвет: применение** — 60/30/10 правило, semantic colors (success/warning/danger), dark mode — не инверсия.
8. **Типографика: анатомия** — x-height, ascender, counter, aperture; как читать specimen.
9. **Типографика: классификация** — serif/sans/slab/display/mono; Vox-ATypI; когда что применять.
10. **Типографика: пары** — правила пар, contrast of axis, matching x-heights; упражнение «найди сломанную пару».
11. **Иерархия типографики** — modular scale (1.125, 1.25, 1.333, golden), fluid type, clamp().
12. **Пространство и ритм** — vertical rhythm, optical alignment, оптическая vs математическая компенсация.
13. **Контраст** — WCAG 2.2 contrast ratios, APCA (новый стандарт), tool: показываем реальные значения.
14. **Брендинг как применение основ** — mark, logotype, systems; кейс: Airbnb Bélo, Mailchimp rebrand, Linear identity.
15. **Иллюстрация и иконки** — стили, pixel grid, 24/20/16 сетки для иконок.

(далее ещё 15 разделов по 2–3 темы: prototyping basics, grids in depth, layout-types, photography for UI, 3D-in-UI, etc.)

**Обязательный capstone**: Style Guide документ — студент делает brand sheet из 8 страниц (палитра, шрифты, spacing, логотип, tone of voice). Публикуется в портфолио.

### INTERFACE (50 тем)

1. **Atomic Design** (Brad Frost) — atoms/molecules/organisms/templates/pages; критика метода (где он ломается).
2. **Компоненты: Button** — variants, states, hierarchy (primary/secondary/tertiary/ghost/destructive), size scale, icon slot.
3. **Компоненты: Input** — states (default/focus/error/disabled/readonly), label position research, helper text vs error.
4. **Компоненты: Form** — single-column preference, inline vs summary validation, real-time validation anti-patterns.
5. **Компоненты: Card** — когда card полезна, когда вредна; tap-target, stacking context.
6. **Компоненты: Table** — data density, right-align numerics, fixed columns, zebra stripes (don't), empty states.
7. **Компоненты: Nav** — IA-to-nav mapping, mega-menu когда оправдан, mobile nav patterns (bottom tabs vs hamburger vs rail).
8. **Компоненты: Modal/Dialog** — когда использовать (редко), focus trap, escape handling, z-index wars.
9. **Компоненты: Toast/Snackbar** — auto-dismiss timing (4–10s), queue management, a11y live regions.
10. **Состояния** — полный state matrix для любого компонента; loading skeletons vs spinners vs progressive.
11. **Empty states** — 0/1/∞ правило; illustrated vs minimal; CTA в пустом состоянии.
12. **Error states** — recoverable vs fatal; 404/500/offline/rate-limit; retry patterns.
13. **Иконография** — stroke vs fill, optical sizing, 2px grid, pairing с типографикой.
14. **Motion в интерфейсе** — ease-out для enter, ease-in для exit; duration scale (100/200/300/500); когда motion вредит.
15. **Микроинтеракции** — Saffer's 4 parts (trigger, rules, feedback, loops); кейсы: Twitter heart, Stripe checkmark.

16–25. **HTML/CSS как инструмент дизайнера**: семантика, box model, Flexbox, Grid, container queries, subgrid, logical properties, CSS variables, @layer, nesting.

26–35. **Design Systems**: токены (color/space/type/motion), component API design, versioning, documenting, governance; разбор Material 3, Carbon, Polaris, Radix.

36–50. Продвинутые темы: data viz, charts, dashboards, maps UI, chat UI, editor UI, admin panels, pricing pages, checkout flows, onboarding flows, email design, push/notifications, error copy.

### EXPERIENCE (40 тем)

1–8. **Research**: interviews (how to ask), observation, diary studies, surveys (bias avoidance), card sorting, tree testing, usability testing (moderated/unmoderated), analytics как research.
9–15. **Synthesis**: affinity mapping, personas (и критика — когда они вредят), JTBD, problem framing, HMW, opportunity solution tree.
16–22. **IA**: mental models, categorization (LATCH), navigation patterns, search vs browse, findability metrics.
23–28. **Flows**: user flows, task flows, service blueprints, journey maps (и чем отличаются).
29–34. **Testing**: usability (severity ratings), a/b testing, multivariate, statistical significance, qualitative vs quantitative.
35–40. **Metrics & a11y**: HEART framework, SUS, NPS critique, WCAG 2.2 practical, cognitive accessibility, internationalization.

### CRAFT (30 тем)

Prototyping (Figma advanced, variables, interactive components), Motion (Principle, Rive, Lottie), Handoff (specs, tokens export), Portfolio (case study structure, storytelling), Critique (giving and receiving), Career (interviews, exercises, whiteboard), Design Ops (rituals, reviews, docs).

### Маппинг на профессиональные rubric-системы

- **NN/g UX Certification** — покрываем все 5 areas (strategy, research, IA, UI, testing).
- **IDF Career Path UX Designer** — 8 курсов IDF маппятся на наши EXPERIENCE + FOUNDATIONS.
- **Google UX Certificate** — совпадение ~80% с EXPERIENCE.
- **Awwwards Academy portfolio review criteria** (craft, originality, usability, content, typography) — используем как финальный capstone rubric.

Каждую тему помечаем тегами, чтобы юзер видел «эта тема = часть NN/g UX Strategy module».

---

## 4. Assessment и практика: «submission + AI feedback» — недостаточно

Текущий план — один тип задания на тему. Это плохо. Нужна пирамида:

### Типы упражнений (по возрастанию когнитивной нагрузки)

1. **Knowledge check** (30 сек) — 1 MCQ или true/false после каждой темы. Цель — retention check. Реализация: inline в Markdown `:::quiz`.
2. **Visual recognition** (1–2 мин) — «какой из этих 4 примеров использует правильный contrast?». Картинки + клик. AI не нужен, ответ детерминирован.
3. **Reorder / sort** (2–5 мин) — «расставь элементы по иерархии», «отсортируй шрифты по x-height». Drag-n-drop, детерминированная проверка.
4. **Spot-the-diff** (3–5 мин) — два почти одинаковых UI, найди 5 нарушений alignment. Overlay-клик по проблемам.
5. **Critique exercise** (10–15 мин) — студент пишет 200–400 слов критики реального UI. AI грейдит по rubric.
6. **Redesign challenge** (30–90 мин) — «редизайн формы X». Submit Figma-link. AI + опционально peer review.
7. **Case study** (несколько дней) — финальный capstone трека.

Соотношение: на 1 тему — 2–3 knowledge checks, 1 mid-task (тип 2–4), 1 опциональный challenge (тип 5–6).

### Rubric для AI-грейдинга

Критично: LLM без rubric выдаёт «looks good, consider improving contrast» на всё. Рубрика должна быть **структурирована** и **примеры-attached**.

Пример rubric для redesign-submission (JSON в frontmatter):

```yaml
rubric:
  dimensions:
    - id: hierarchy
      label: "Визуальная иерархия"
      levels:
        1: "Нет явного порядка чтения; элементы конкурируют."
        3: "Иерархия читается, но есть 1-2 спорных акцента."
        5: "Чёткая иерархия через размер/вес/пространство; глаз ведётся."
      weight: 0.25
    - id: alignment
      label: "Выравнивание и сетка"
      levels: {1: "...", 3: "...", 5: "..."}
      weight: 0.20
    - id: typography
      label: "Типографика"
      weight: 0.20
    - id: color
      label: "Цвет и контраст (WCAG AA)"
      weight: 0.15
    - id: ux_clarity
      label: "Ясность UX-задачи"
      weight: 0.20
  reference_examples:
    - url: "/assets/rubric-examples/hierarchy-5.png"
      score: 5
    - url: "/assets/rubric-examples/hierarchy-2.png"
      score: 2
```

Промпт к LLM вкладывает rubric + reference examples (multimodal, claude-opus видит картинки). Без few-shot — не работает.

### Портфолио-выход

После трека FOUNDATIONS у студента должно быть:
- Style sheet (1 файл Figma)
- 5 micro-exercises (сетки, цветовые палитры, typographic specimens)
- 1 case study («переделал X — вот процесс»)

После INTERFACE:
- Работающий mini design system (8 компонентов) с Storybook-like превью
- 3 редизайна

После EXPERIENCE:
- Research report (интервью + synthesis + findings)
- Usability test report
- Journey map

После CRAFT + all trackов: **портфолио-сайт** (автогенерируется из submissions). Это killer-фича — студент выходит с реальным портфолио, а не с PDF-сертификатом.

---

## 5. Интерактивные виджеты — список

Code playground и Figma-embed — минимум. Вот что даст реальный обучающий эффект:

1. **Hierarchy reorder** — 5 элементов (headline, body, CTA, eyebrow, image), drag-reorder, система показывает heatmap «как глаз будет читать» (F-pattern simulation).
2. **Spacing tuner** — слайдер padding/margin/gap, юзер крутит до «правильного» значения, оценка близости.
3. **Color contrast sandbox** — выбери fg/bg, покажи WCAG AA/AAA + APCA score + превью реальным текстом.
4. **Type pairing lab** — выбери два шрифта из библиотеки (Google Fonts API), система оценивает пару по эвристикам (contrast of axis, x-height diff).
5. **Grid builder** — задаёшь columns/gutter/margin, видишь как лендинг ложится; снепшоты сохраняются.
6. **Before/after slider** (уже в плане) — хорошо, но добавить **annotation layer**: наведи — появляется подпись «здесь упростили nav».
7. **Critique mode** — UI + markup tool: юзер ставит пины с комментариями, сравнивает со «story» от автора урока.
8. **Component state explorer** — кликаешь по button, видишь все его state'ы (hover/focus/active/disabled/loading); дополнительно — показывает CSS.
9. **Principle-checker** — загружает скриншот, bounding-boxes выделяют нарушения alignment (автоматически через CV или faked). Обучает видеть «кривые» сетки.
10. **Flow builder** — drag-drop для user flows, проверяет по heuristics (есть ли error branch? back-path?).
11. **Figma → code** — кусок Figma-токенов (JSON) и code-tab показывает CSS переменные; юзер учит handoff.
12. **A11y simulator** — симуляция дальтонизма (protanopia/deuteranopia/tritanopia), blur (low vision), screen-reader rail.
13. **Live WCAG-check на playground** — пока пишешь CSS, ошибки контраста подсвечиваются.
14. **Motion-curve editor** — рисуешь bezier, видишь анимацию; сравни с «правильной» для enter/exit.

Эти виджеты — **core differentiator**. Никто в русскоязычном сегменте такого не делает. Designlab имеет часть, но только для платных студентов.

---

## 6. Community и ретеншн

План говорит «комментарии — не обязательно для v1». Это большая ошибка. Ретеншн в edtech без социалки — 5–10%. С — 30–40%.

### Минимум для v1 (низкая стоимость):

1. **Streaks** — ежедневная галочка (решил quiz / открыл тему). Duolingo-эффект работает и тут.
2. **Weekly digest** — email «ты прошёл X, впереди Y, вот интересный кейс».
3. **Public submissions gallery** — после submission юзер может **opt-in** публиковать. Гэллерея видна всем. Это **огромный** мотивационный крюк — студенты хотят попасть «в витрину».
4. **Like/save** на чужих submission (простая соцка).
5. **Ежемесячный design challenge** — одна задача на всех, дедлайн, топ-10 на главной.

### Mid-term (после v1):

6. **Cohorts** — необязательные группы по 30 человек, которые идут вместе; общий chat room; peer-review submissions.
7. **Critique circles** — раз в неделю 4 студента обмениваются работами по structured format (SBI или I-Like-I-Wish-What-If).
8. **Office hours** — запись с экспертом 1 раз в месяц, Q&A.
9. **Mentor-badge** — студенты с X completed tracks могут модерировать критики новичков (gamification + свободный труд).

### Ретеншн-механики, которые доказаны в edtech

- Spaced notifications (см. §1).
- Loss aversion: «твой streak сгорит через 6 часов».
- Social proof: «34 человека сейчас изучают эту тему».
- Progress visibility на главной: «47/150 completed, next milestone at 50».

---

## 7. Дифференциация: чем бить конкурентов

Текущий план в этом месте молчит. Это опасно, потому что **без чёткого diff-а продукт не выстрелит**. Разберём игроков:

| Конкурент | Сила | Слабость |
|-----------|------|----------|
| **Designlab** | Менторство 1-на-1, bootcamp-формат | $800–7500, английский, синхронный |
| **Interaction Design Foundation** | Огромная библиотека, $14/mo | Скучный UI, длинные тексты, слабые упражнения |
| **Coursera (Google UX)** | Бренд Google, доступность | Низкое качество заданий, peer review халявный |
| **DesignCourse (Gary Simon)** | Практичность, frontend-ориентация | Не систематичен, YouTube-формат |
| **Flux Academy** | Красивое видео, Ran Segall | Дорого, фокус на freelance |
| **Skillbox (ру)** | Рынок, бренд, программа | Стоимость $1500+, длинные курсы, слабая практика |
| **Bang Bang Education** | Дизайн-уклон, бренд | Дорого, мало про web и UX |

### Где наш unique value

1. **Русский язык + современный стек** — Skillbox/BBE учат на устаревших инструментах (Photoshop-based примеры). Мы — Figma, Tailwind, современный HTML/CSS, OKLCH, container queries.
2. **Интерактивные виджеты, которых нет нигде** — см. §5. IDF и Coursera дают статичный текст + видео. Designlab даёт Figma-задания, но без встроенных учебных тулов.
3. **AI-грейдинг с rubric** — asynchronous peer review у всех конкурентов медленный и плохой. Качественный AI-грейд — это 10× преимущество по скорости feedback-loop (получил оценку через 30 сек, а не через 3 дня).
4. **Frontend-integration** — ни у кого из «чистых» дизайн-школ нет. Мы учим дизайну **через призму реализации** — это killer-feature для рынка, где дизайнеры часто работают в парах с разработчиками и/или пилят сами.
5. **Портфолио-генератор** — у других ты после курса имеешь PDF-сертификат. У нас — работающий портфолио-сайт.
6. **Цена** — если монетизировать как $10–15/mo подписку (как IDF), это рвёт Skillbox по цене на порядок.

### Чем **не** бить

- Не пытаться делать «менторство» — это дорого и не масштабируется. AI-грейдинг + community peer review.
- Не пытаться закрыть весь BRAND / motion / 3D — это делают специализированные школы лучше.
- Не делать сертификаты как главный value. Портфолио важнее.

### Позиционирование одной фразой

**«Самоучитель веб-дизайна с интерактивной практикой — для тех, кто хочет дизайнить и понимать, как это реально работает в коде.»**

---

## 8. Что поправить в плане конкретно и немедленно

1. **§3 Архитектура контента**: заменить 6 треков на 4. BRAND распределить в FOUNDATIONS, FRONTEND — в INTERFACE/CRAFT.
2. **§3 frontmatter**: добавить `requires`, `blooms_level`, `estimated_minutes`, `rubric_id`, `exercise_types`.
3. **§4 план контента**: переписать по outline из §3 этого review; минимум 100 тем на v1, не 40.
4. **§6 новое для дизайна**: добавить widgets из §5. Минимум для v1: hierarchy-reorder, color-contrast, type-pairing, spacing-tuner, a11y-simulator.
5. **§7 БД**: добавить модели `Rubric`, `RubricDimension`, `Exercise`, `ExerciseAttempt`, `ReviewQueue` (spaced repetition), `Streak`, `LearningPath`, `PathStep`.
6. **§8 фазы**: фаза 2 (UI) без фазы «пилотный контент на 5 тем с полной педагогической системой» — риск сделать красивый контейнер и пустой контент. Написать **1 полноценный раздел** (Типографика, 5 тем, со всеми типами упражнений) до начала работы над админкой.
7. **§10 критерии готовности v1**: добавить «5 интерактивных widgets», «AI-грейдинг с rubric на 20 упражнений», «streaks + daily digest email», «public submissions gallery».
8. **§11 монетизация**: не «решить до v1», а **решить сейчас**. Предлагаю: freemium — FOUNDATIONS бесплатно, остальные треки по $9/mo. Это валидирует гипотезу и собирает аудиторию.

---

## 9. Риски

1. **Контент-долг.** Написать 150 тем качественно — 6–9 месяцев работы одного эксперта full-time. Без этого проект умирает. Нужен план авторов / заимствований.
2. **AI-грейдинг может быть плохим.** Без rubric+examples — 100% будет плохим. Закладывайте 2–3 недели на prompt-engineering и eval-сет.
3. **Russian-first vs English market.** Ру-рынок меньше и беднее. Если монетизация — думайте об i18n **сразу**, не «на будущее».
4. **Конкуренция со Skillbox**. У них маркетинг. Наш ответ — качество продукта + SEO на long-tail темах («OKLCH в CSS», «spacing в Figma»).

---

## Итог

План сейчас — это **технический scaffold**, за который ставлю 8/10. Педагогическая часть — **3/10**. Не потому что плохо, а потому что её почти нет. Всё, что выше — это перевод плана из «клон диаболуса для дизайна» в «настоящий edtech-продукт». Без §1, §4 и §5 — получится красивый сайт, на котором никто не учится.

Приоритет: §4 (assessment pyramid) и §5 (интерактивные виджеты) — вот где весь product-market fit.
