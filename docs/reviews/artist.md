# Art Direction Review — Forma et Functio

**Reviewer:** Senior art director / brand designer
**Document reviewed:** `docs/implementation-plan.md`
**Stance:** opinionated. The plan is a solid engineering scaffold but the visual brief is a placeholder. Below is what it must become.

---

## 1. Brand positioning — the problem with "Swiss meets modern web"

The plan's one paragraph of visual direction (off-white, graphite, one accent, Inter, 12-col grid) is not a brand. It is the default. Every serious SaaS startup since roughly 2018 has arrived at exactly these coordinates. Vercel, Linear, Stripe, Figma's marketing site, Arc, Raycast, Framer, Read.cv, Mintlify, Resend — they all live within a five-degree radius of this description. If a Russian-speaking UI student lands on Forma et Functio and cannot tell within three seconds that it is **not** a YC startup landing page, we have failed at identity.

"Swiss design" is also vaguer than it sounds. Müller-Brockmann (Zurich school, 1950s–60s grid work) is a very different animal from Wim Crouwel (Total Design, 1960s–70s, systematic letterforms, Amsterdam — not technically Swiss but grouped with it), from Wolfgang Weingart (Basel school, 1970s–80s, deliberate rule-breaking), from Emil Ruder (typography as structure, Basel, 1950s). Which one?

**My proposition:** Forma et Functio is *not* neo-Swiss. It is **post-Swiss pedagogical**, drawing specifically from:

- **Emil Ruder's "Typographie" (1967)** — didactic layouts where the spread itself teaches the lesson.
- **Karl Gerstner's "Designing Programmes" (1964)** — design as a system of parametric decisions, not finished artefacts. This is the intellectual spine.
- **Bruno Munari's "Design as Art" (1966)** and his children's books — playfulness, diagrams that think, the Italian tradition of the designer-as-educator.
- **Total Design era Dutch pragmatism** — Crouwel's New Alphabet as pedagogy (a wrong typeface that teaches the grid).
- **A dash of Memphis/Sottsass (1981–87)** at the edges — because pure Swiss in 2026 is embalmed. A Russian audience remembers Rodchenko and El Lissitzky; constructivist echoes are closer to home than Helvetica.

Positioning statement, one sentence: *Forma et Functio is the spread from a 1966 design manual, typeset in the browser, running on Next.js.* That is a distinct visual promise. It is not Vercel. It is not Stripe.

**Implication for differentiation:** the site must look **editorial before it looks like software**. A reader should feel they are inside a publication, not a product. Every page is a page, not a dashboard.

---

## 2. Identity system

### 2.1 Wordmark

"Forma et Functio" is a four-word logotype with an inconvenient Latin conjunction. Do not set it in Inter. Inter is a UI font; it has no voice. Instead:

**Primary wordmark:** set in **GT Alpina** (Grilli Type) or **Söhne Breit** (Klim) — both have a serif/sans dialogue with 20th-century modernist roots. My recommendation is a custom-lettered wordmark based on the proportions of **Dala Floda** (a reverse-contrast serif) or **Editorial New** (Pangram Pangram, free-for-personal). Reverse-contrast (thin verticals, thick horizontals) is the visual signature of 19th-century French vernacular turned into 1960s didactic tradition — Roger Excoffon territory. It says "book" and "manifesto" simultaneously.

**Treatment:** lowercase, letter-spaced to +20 tracking at display size, with the "et" italicised and smaller — a classical manuscript convention. The ampersand alternative (`forma & functio`) is permitted for cramped contexts, but the full Latin is the canonical form.

```
forma et functio
```

Not `Forma et Functio`. Capital F's are assertive and Anglo; lowercase is bookish, European, and aligns with the pedagogical register. The user is not buying a product — they are opening a manual.

### 2.2 Monogram / mark

"F⋅F" ligature is the obvious move and therefore slightly suspect. Do it, but with discipline:

- **The F·F mark** as a typographic ligature where the two F crossbars **share a single horizontal stroke** — literally "form follows function" as letterform logic. The second F becomes a consequence of the first.
- **Scale variant:** at favicon sizes the shared crossbar becomes a single dot between F and F — a typographer's centred period, echoing the Latin inscription punctuation `F·F`.
- **Grid variant:** a 3×3 module grid where F·F is drawn with four filled cells. Used as a pattern primitive on OG images and section dividers.

Avoid: geometric abstraction (a circle, a square, an "innovative" shape). The brand is not a startup; it does not need a mascot.

### 2.3 Type system

Three typefaces, role-defined, no more:

1. **Display / headlines:** **GT Alpina** (serif with italic variation) *or* — budget route — **Newsreader** (Production Type, free on Google Fonts). Newsreader is quietly excellent and free, and its italic has real character. Use for h1–h2 and editorial pull quotes.
2. **UI / running text in product chrome:** **Söhne** (Klim, paid) *or* **Inter Display** cut with manual optical adjustments. Grotesque, neutral, great at 14–16px. Only here does Inter earn its place.
3. **Monospace / code & specimens:** **Berkeley Mono** (US Graphics) *or* **JetBrains Mono**. Code playground, terminology call-outs, "definitions" in margins.

**Not on the page:** Space Grotesk (overused 2021–2024), Satoshi (same), Geist (explicitly the Vercel voice — avoid), Neue Haas Grotesk (too editorial-magazine-generic in this exact colourway).

**Type scale** (see §4).

### 2.4 Colour system

The plan's "off-white + graphite + one electric accent" is correct in spirit but anaemic in specification. A design-education site needs colour **with a point of view**, because it will itself be taught. Palette:

| Role | Name | Light mode | Dark mode | Usage |
|------|------|------------|-----------|-------|
| Paper | `paper` | `#F4F1EA` | — | Page background, warm cream, not white. Warmth matters: pure white reads "app", cream reads "book". |
| Ink | `ink` | `#14110F` | — | Body text, near-black with warmth. Not `#111`. |
| Ink muted | `ink-60` | `#14110F` @ 60% | — | Secondary text. |
| Rule | `rule` | `#C8C3B8` | `#2A2722` | Hairlines, dividers (0.5px). |
| Accent | `cinnabar` | `#D8412F` | `#E8604D` | Primary accent. See below. |
| Accent secondary | `lapis` | `#1B3A8B` | `#4B6AC9` | Links, diagrams, state. |
| Highlight | `ochre` | `#E3B23C` | `#F0C858` | Callouts, "key insight" blocks, sparingly. |
| Paper (dark) | `paper-dark` | — | `#16130E` | Dark-mode background — near-black with brown undertone, not grey. |
| Ink (dark) | `ink-dark` | — | `#ECE6D8` | Dark-mode body — cream, not white. |

**Why cinnabar, not electric blue or red-orange?** Electric blue (`#3D5AFE`) is a software-product colour. Red-orange (`#FF5722`) is a Material-3 construction-site colour. **Cinnabar** (киноварь — the mineral, the pigment, the colour of medieval Russian iconography and of rubrication in hand-copied books) is historically correct, visually specific, and carries meaning for a Russian-reading audience. It is also close to Rodchenko's reds without being a constructivist pastiche.

**Usage rules:**

- Cinnabar only on: interactive primary (CTA), currently-reading progress indicator, the F·F mark at specific moments. **Never** on large background fills.
- Lapis only on: inline links (underlined), diagram accents, graph strokes.
- Ochre only on: "key insight" blocks, quoted masters, "try this" prompts. One ochre block per topic, maximum.
- Paper and ink do 90% of the work. If in doubt, remove colour.

### 2.5 Iconography

**Do not** use Lucide as-is across the product, despite the plan specifying it. Lucide is fine for admin chrome and navigation. For content — diagrams, callouts, concept markers — it is both too thin and too generic.

**Proposal:** custom icon language called **"Marks"**. Rules:

- Drawn on a 24×24 grid with **two stroke weights only**: 1.5px for structure, 0.5px for detail (hairlines).
- Terminals are **square-cut, not rounded**. (Lucide rounds everything; this is where half the homogeneity of modern UIs comes from.)
- Every icon has a typographic cousin — if the concept has a letterform (₽, §, ¶, ‖, †), we use the glyph before we draw an icon.
- 30-icon starter set covering: concept markers (gestalt, hierarchy, rhythm, contrast, scale, grid), content types (exercise, reading, watch, discuss, ship), states (in-progress, complete, needs-review).

Use Lucide only for pure UI affordances (chevrons, close, menu).

---

## 3. Art direction for content

### 3.1 No stock photos — so what goes in the hero of every lesson?

Three permitted categories, chosen per topic:

1. **Didactic diagrams** — vector illustrations that *are* the lesson. On a gestalt topic, the hero is a gestalt diagram, large, labelled, finished. Reference: the diagrams in Kepes's *Language of Vision* (1944), or Munari's *Square/Circle/Triangle* trilogy.
2. **Typographic specimens** — for any topic where type or letterforms are the subject, the hero is the specimen itself, set at display size, with annotations. Reference: Experimental Jetset, Hoefler & Co. catalogues, Commercial Type's specimen PDFs.
3. **Reproduced historical works** (with attribution) — for history-rooted topics, a full-bleed reproduction of a canonical work: Müller-Brockmann's Tonhalle posters, a Lissitzky Proun, a Glaser "I ♥ NY" sketch, a Mucha, a Rodchenko book cover. Licensed or public domain only. Every such image credited in the margin in small caps.

**Rule:** no isometric illustrations of little people doing things. No 3D gradient blobs. No hand-drawn "friendly" Duolingo-owl aesthetic. No AI-generated decoration. The hero must **be the content**, not announce it.

### 3.2 Diagram style

One unified vocabulary across the entire portal, because consistency of diagrammatic language *is* a pedagogical tool:

- **Flat vector, two weights** (matching the icon system), on paper background.
- **No drop shadows. No gradients. No 3D.** Ever.
- **Annotations in italic serif** (Newsreader italic), set at 12px, with thin leader lines (0.5px cinnabar).
- **Measurement callouts** borrow drafting conventions: dimension lines with arrow tips, tick marks, exactly as in an architectural drawing.
- **Axonometric when depth is required** — not perspective, not isometric-cartoon. Axonometric (30°/30°) is the technical-manual convention; it reads as "reference", not "illustration".

Exceptions: topics on motion, colour, and fluid type may use embedded interactive SVG/Canvas demos. These obey the same palette and rules.

### 3.3 Illustration style for abstract concepts

Gestalt, hierarchy, contrast, rhythm — these resist figurative illustration. Do not try. Instead:

- **Use type itself** as the illustration. A lesson on hierarchy shows hierarchy, in 14 weights and sizes, demonstrating the concept on its own body. A lesson on rhythm shows rhythm, in a paragraph of Lorem that has been rewritten to make the point.
- **Use geometric primitives** (square, circle, triangle — Munari/Bauhaus lineage) for formal concepts. A filled square, a dot grid, a bar. Rendered at *significant* scale — a circle that is 70vh tall, not a 48px icon.
- **Use reduction**: the Dieter Rams approach — illustrate "less is more" by removing things, frame by frame, until only the essential remains. Use scroll-linked sequences for this, sparingly.

### 3.4 Visual quality supports pedagogy

Commit this line: **"Everything on screen must be learnable from."** No decorative accent that does not demonstrate a principle. The hairline between sections is a hairline because we are teaching the hairline. The type-size jump from h3 to body is 1.414× because we are teaching the √2 modular scale. Students should be able to open DevTools and find the lesson in the CSS. Make the stylesheet itself part of the curriculum.

---

## 4. Layout, grid, editorial

### 4.1 Baseline grid and type scale

**Baseline:** 8px. All vertical rhythm snaps to 8px. Body text leading is 24px (3 × 8). All vertical spaces between blocks are multiples of 8.

**Type scale** — modular, ratio **1.25 (major third)** for body ladder and **1.414 (√2)** for display ladder. Two ratios because display and text have different perceptual needs. Specimen:

| Role | Size (px) | Line-height | Tracking | Notes |
|------|-----------|-------------|----------|-------|
| display-xl | 96 | 96 (1.0) | -2% | Homepage hero only |
| display-l | 68 | 72 | -1.5% | Track page H1 |
| display-m | 48 | 56 | -1% | Topic page H1 |
| h1 | 34 | 40 | -0.5% | Serif |
| h2 | 27 | 36 | 0 | Serif or sans, contextual |
| h3 | 22 | 32 | 0 | Sans, bold |
| body-l | 19 | 28 | 0 | Lead paragraph |
| body | 17 | 28 | 0 | Running text, serif |
| body-s | 15 | 24 | +0.5% | Captions, UI |
| caption | 13 | 20 | +2% | Margins, credits |
| mono | 14 | 24 | 0 | Code |

**Reading measure:** 62 characters. Non-negotiable. Long-form content is constrained to a column of approximately 620–680px regardless of viewport. The rest of the viewport is margin, margin is not wasted space — it is the page.

### 4.2 Module grid

A **16-column grid**, not 12. Twelve is the Bootstrap default and thinks in thirds and quarters. Sixteen divides cleanly into halves, quarters, eighths, and — crucially — offers a **7 + 2 + 7** main/gutter/margin layout that lets content breathe and still supports sidebars.

- Desktop (≥1280px): 16 cols, 24px gutters, 80px outer margin.
- Topic page default: content in cols 3–10 (8 cols), interactive/margin notes in cols 12–15 (4 cols), col 11 empty as a breathing gutter. This is the **Edward Tufte margin-note convention**, not a "sidebar".
- Tablet (768–1279): 8 cols, content 1–6, notes slip below or to col 7–8.
- Mobile: single column, margin notes become inline call-outs with a hairline rule and italic serif.

### 4.3 When to break the grid

- **Start of each lesson section:** full-bleed hero image or typographic spread. No grid. Page-break convention.
- **Pull quotes from masters** (Rams, Munari, Tschichold, Lissitzky): break into the margin, italic serif, oversized opening quotation mark as a ghost character behind the text.
- **End-of-topic synthesis:** break to full-bleed colour block (cinnabar on paper, or ochre) for the summary. One per topic, earning its place.

### 4.4 Rhythm and pacing for long-form

A lesson of 2,000 words must not feel like 2,000 words. Pacing devices:

- **Drop cap** on the first paragraph of each major section (serif, 3 lines tall, cinnabar).
- **Small-caps section breaks** with a dinkus (`· · ·`) between paragraphs on thematic shifts.
- **Margin notes** with term definitions, cross-references, dates. The reader's eye leaves the main column, rests, returns — that is pacing.
- **Diagrammatic breathers** every ~400 words. Not decorative. Always load-bearing.
- **"Try this" interactive blocks** every ~600 words. These are anchored to the text, visually distinct (ochre rule above and below), not hovering UI cards.

Reference texts: Robert Bringhurst, *The Elements of Typographic Style*; Ellen Lupton, *Thinking with Type*; Josef Müller-Brockmann, *Grid Systems in Graphic Design*.

---

## 5. Motion language

Motion must read as **paper responding to touch**, not as software animating.

### 5.1 Principles

- **Easing:** one custom curve — `cubic-bezier(0.2, 0.0, 0.1, 1.0)` — "paper ease". Slightly more linear entry than Material. No bounce, ever.
- **Durations:** three values only. `120ms` (micro — hover, focus), `240ms` (small — tooltips, inline reveals), `480ms` (page transitions, modal entry). Nothing above 480ms except explicit user-controlled sequences.
- **Distance:** motion distance is always a fraction of the typographic grid. Elements translate by 4px or 8px, not 20px. Gentle.

### 5.2 Micro-interactions that reinforce learning

- **Progress meter** on each topic is a **baseline-aligned rule** that grows left-to-right as the user scrolls. The rule is exactly 0.5px — same as the content hairlines. Progress is literally continuous with the page, not a bar above it.
- **Completion** triggers a single discrete event: the F·F mark in the header briefly ligates (the dot between F and F grows to full crossbar). 320ms. No confetti. No checkmark pop.
- **Hover on code blocks** underlines the matching line in the preview iframe (subtle cinnabar, 1px). Teaches correspondence.
- **Read/unread** state on topic list: unread items render in ink; read items fade to 40% ink over 400ms when the state changes in-session.

### 5.3 Off-limits

- Parallax.
- Scroll-jacking of any kind.
- Reveal-on-scroll for decorative purposes (text fading up as you scroll). Permitted only if the reveal *is* the lesson (e.g., a lesson on progressive disclosure).
- Hover transforms on images and cards. Cards are not buttons.
- Shimmer skeleton loaders that pulse. Use static grey rules.
- Any easing curve with overshoot.
- Lottie files, except for explicitly pedagogical animations embedded in lessons on motion.

The test: *if you remove every animation, does the site work?* It must. Motion is only ever an amplifier.

---

## 6. Dark mode

The plan demotes dark mode to "secondary". I disagree — but not by insisting on parity. Dark mode should be a **legitimate alternate personality**, not an inversion.

**Concept:** light mode is the **printed book**. Dark mode is the **studio at night** — the designer working late, the dimmed room, the screen as the only light source. It is not called "dark". It is called, in the UI settings, **«Студия»** (Studio).

- Background `#16130E` — a very dark brown, warmth preserved.
- Body text `#ECE6D8` — cream, not white. Reduces glare, stays bookish.
- Accent cinnabar shifts warmer and slightly brighter (`#E8604D`) — kept at ≤ 6% of pixels on screen.
- All rules and hairlines step up in value (`#2A2722`) but remain 0.5px.
- Images in dark mode get a -2% luminance filter applied globally, so full-bleed historical reproductions do not scream.
- **Typography:** body text becomes the italic companion (Newsreader italic) by default — because handwritten, intimate, studio register. This is a real differentiator; nobody is doing this. (Optional toggle for users who prefer roman italic-switching.)

Dark mode is not secondary in quality, only in default. Invest in it properly.

---

## 7. Comparison studies

Brief, opinionated, with concrete take-aways.

**1. Interaction Design Foundation (interaction-design.org).**
*Good:* comprehensive curriculum, serious tone.
*Bad:* visually a textbook-publisher CMS from 2015. Stock photos everywhere. Type is Open Sans. No voice.
*Steal:* nothing visual.
*Avoid:* authority-by-density trap. They look credible because they look boring. We can look credible and have taste.

**2. Designlab (designlab.com).**
*Good:* strong marketing craft, good colour system.
*Bad:* reads as a bootcamp upsell. Everything is optimised for "enroll now" CTAs. The education is invisible on the homepage.
*Steal:* their mentorship/cohort UI patterns, if we ever add social features.
*Avoid:* the marketing-first tone.

**3. DesignCourse (designcourse.com) / Gary Simon's YouTube.**
*Good:* contemporary, trend-aware.
*Bad:* trend-chasing itself. Looks like it was designed last Tuesday and will be re-skinned next Tuesday.
*Steal:* energy on homepage hero. A design-ed site should not be sleepy.
*Avoid:* chasing Dribbble gradients.

**4. Figma community / figma.com marketing.**
*Good:* strong system, readable, great use of small type and tabular numerals.
*Bad:* corporate. The marketing site has been sanitised; it no longer looks like the weird, playful, idiosyncratic Figma of 2018.
*Steal:* their disciplined scale, their use of tabular numerals in tech specs.
*Avoid:* the sanitation. Keep voice.

**5. Are.na (are.na).**
*Good:* the gold standard for editorial-as-software. Custom serif (Nitti), actual margins, the grid is real. Reading-first. Slow software on purpose.
*Bad:* the learning curve is a wall for newcomers.
*Steal:* everything about their type system, margin usage, and refusal of standard web gestures. Are.na is the single closest reference.
*Avoid:* their opacity. We are a teaching tool, not a refuge.

**6. Present & Correct (presentandcorrect.com).**
*Good:* a pure expression of graphic-design taste as commerce. Product shots as editorial. Tiny type, real margins.
*Bad:* not a teaching site, not interactive.
*Steal:* their photography-as-layout discipline; their tiny, confident captions.
*Avoid:* nothing — they are a pole star for tone.

**7. Works That Work magazine (worksthatwork.com).**
*Good:* Peter Biľak's project — serious editorial design for a tech-adjacent subject. Serifs, columns, margins, pace.
*Bad:* somewhat frozen in 2015 web patterns.
*Steal:* their commitment to reading as the primary interaction. Their footnote/margin system.
*Avoid:* inheriting their dated interaction patterns.

**8. Case Study Club (casestudy.club).**
*Good:* curation of UX case studies. Clean cards.
*Bad:* exactly the generic design-portal aesthetic the plan currently skews toward. Cards-cards-cards.
*Steal:* nothing.
*Avoid:* the default card grid. Ours must be editorial, not a gallery.

**9. Readymag templates / Cargo / Semplice.**
*Good:* maximalist portfolio tooling, often beautiful.
*Bad:* a trap. Maximalism signals portfolio, not pedagogy. A student studying hierarchy cannot learn from a site that overuses it.
*Steal:* their confidence with display type.
*Avoid:* the portfolio register. Our register is textbook.

**10. Kottke.org, The Browser, Aeon, The Pudding.**
*Good:* long-form editorial on the web done well. The Pudding especially treats each article as a bespoke typographic object.
*Steal:* willingness to vary per-article layout, consistency of voice despite that variation.
*Avoid:* The Pudding's per-article reinvention overhead — we need systems. The idea is to design a system that *produces* Pudding-quality spreads with minimal bespoke work.

**Honourable mention — Rodchenko's books and LEF magazine (1923–28):** constructivist magazine design from the audience's own visual heritage. Reference freely, steal subtly, avoid pastiche.

---

## 8. Specific mockup directions

### 8.1 Homepage hero

Top of page: a full-width 80vh band, paper background. At cols 3–14, the wordmark `forma et functio` set at display-xl, 96px, Newsreader regular, cinnabar "et" in italic. Below, a 0.5px hairline running the full measure. Below the rule, at cols 3–10, a single sentence: *«Учебник цифрового дизайна — с примерами, которые работают в браузере.»* — set in 19px serif, black. To the right (cols 12–15), a vertical stack of four tiny captions in 13px sans smallcaps: `40+ разделов`, `6 треков`, `Живые примеры`, `На русском`. Each number set in tabular numerals, cinnabar. No button. The page continues past the fold; the first track card starts at exactly 100vh so the fold is a deliberate turn.

Below the fold: a **6-row horizontal grid of tracks**, each row a full-bleed horizontal module (1 of 6 with the track title in display-m, a three-line description in serif body, a track colour-strip at left edge 4px wide). Hovering a row reveals a thin cinnabar underline under the title — nothing else. Clicking opens the track page. The tracks are stacked vertically, not a card grid, because the homepage is a table of contents, not an app store.

### 8.2 Track page

H1 at display-l, set at cols 3–12, with a sub-hairline and the track's short manifesto in body-l serif. To the right (cols 13–15): a small axonometric diagram summarising the track structure — which lessons feed which, rendered as a small graph. This is a real diagram, not decoration.

Below: lessons as a **numbered list, not cards**. Each lesson is a row:
- Col 3: number in tabular lining figures, 22px mono.
- Col 4–9: lesson title in h3 + one-line description in body-s.
- Col 10–11: estimated read time + level (e.g., `14 мин · начальный`) in 13px smallcaps.
- Col 13–15: tiny progress rule (0.5px, cinnabar, filled proportionally).
- Hover: row background shifts to `#EDE7DB` (a half-step off paper), no other change.

No cards. Numbered rows. This *is* a textbook's table of contents.

### 8.3 Topic page

Three-band vertical structure. **Band A (hero):** full-bleed, 60vh minimum. Content is whatever the topic's canonical image is (historical reproduction / type specimen / diagram). At the bottom-left corner of the band, in 13px smallcaps: `Трек UI · Раздел 04 · Тема 03 · 14 мин`. Top-right: the F·F mark linking home. Clean.

**Band B (reading):** cols 3–10 for running text (body serif, 17/28). Cols 12–15 for **margin notes** — term definitions, dates, cross-refs — set in 13px italic serif, each separated by a thin rule. Drop cap on first paragraph. Section breaks use small-caps headings (`§ 01 · ПРОПОРЦИИ`, etc.). Interactive components (code playground, color picker, contrast checker) are inline at full main-column width, preceded by an ochre rule and labelled `Упражнение` in smallcaps. After the exercise, another ochre rule, and reading resumes.

**Band C (synthesis):** full-bleed cinnabar band at the end, paper-coloured text, summary in display-m, a list of "key takeaways" set in 19px serif, and the next-topic link set in h3. The cinnabar band is earned; it closes the topic like a colophon.

The two-column plan in the original doc is a 2020-era pattern (content/sticky sidebar). Reject it. Use the margin-note Tuftean pattern instead — it is richer, more readable, and more on-brand.

### 8.4 Onboarding

Onboarding is four screens, no progress bar, no "step 1 of 4" — because the user is being invited into a studio, not a funnel.

- **Screen 1 — welcome.** Paper. Full-screen wordmark at display-xl. Below: one sentence. One input field (name, optional). One quiet button, `Войти →`, 13px mono, cinnabar underline only on hover.
- **Screen 2 — track.** Six large row-buttons, exactly as the track list on the homepage. Selecting one is selection; there is no "next". A single hairline animates under the selected row.
- **Screen 3 — level.** Three options displayed as three *specimens* of typography — "beginner" set at 22px, "intermediate" at 40px, "advanced" at 68px. Select by clicking the word. Self-referential: the form teaches scale.
- **Screen 4 — goal.** A text area, paper with a single hairline underneath, invited by a prompt in italic serif: *«Что вы хотите научиться делать?»* Typing is encouraged but optional. Button: `Начать чтение →`.

Onboarding takes 30 seconds. It should feel like a turning of pages, not a form fill.

---

## Closing note

The plan's engineering spine is good; keep it. The visual brief is a blank that needs the above filling in. The single most important decision is to commit to **editorial, not product** as the register — and to defend that commitment in every component review. Every time someone asks "can we make this more engaging" and means "add a gradient card", the answer is "no, we will make it more rigorous." That is the brand.

*— Reviewed April 2026*
