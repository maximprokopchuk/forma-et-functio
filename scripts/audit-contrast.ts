#!/usr/bin/env tsx
/**
 * WCAG contrast audit — plan §13.
 *
 * Parses src/app/globals.css for `--token: oklch(...)` declarations in the
 * `:root` (light) and `:root.dark, .dark` (dark "Студия") blocks, then walks
 * a hand-curated list of foreground/background pairs and computes WCAG 2.1
 * contrast ratio in both themes via culori OKLCH→sRGB conversion.
 *
 * Pair tier:
 *   "body"  — ≥ 4.5 : 1 (default WCAG AA for normal text)
 *   "large" — ≥ 3   : 1 (≥18pt or ≥14pt bold; structural elements)
 *
 * Alpha tokens (ink-muted is `... / 0.6`) are composited against their
 * intended background before measurement, so the published number reflects
 * what a user actually sees on screen, not the abstract token value.
 *
 * Exits non-zero on any failure. Run via `pnpm run audit:contrast`.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { converter, formatHex, parse, type Color } from "culori";

const CSS_PATH = path.join(process.cwd(), "src", "app", "globals.css");

type Theme = "light" | "dark";

type Pair = {
  fg: string;
  bg: string;
  /** Optional composite background for alpha-fg, e.g. ink-muted on paper. */
  alphaOver?: string;
  tier: "body" | "large";
  /** Restrict the check to specific themes — defaults to both. */
  themes?: Theme[];
  note?: string;
};

const PAIRS: Pair[] = [
  // Body text on canvas — the workhorse pair, holds 90% of the typography.
  { fg: "ink", bg: "paper", tier: "body", note: "Body text on page" },

  // Muted body text (60% alpha). Composites against paper before measurement.
  {
    fg: "ink-muted",
    bg: "paper",
    alphaOver: "paper",
    tier: "body",
    note: "Secondary text on page",
  },

  // Inline link colour on canvas.
  { fg: "lapis", bg: "paper", tier: "body", note: "Inline link" },

  // Cinnabar accent text — only used for crops of large display type
  // (overall score, streak counter, F·F mark) and CTA backgrounds. Tier
  // "large" matches WCAG 1.4.3 (≥18pt regular / 14pt bold).
  {
    fg: "cinnabar",
    bg: "paper",
    tier: "large",
    note: "Cinnabar large display text / CTA",
  },

  // Darker cinnabar variant — used for body/caption text on paper bg
  // (HeroCaption metric, quiz/widget action buttons). Must hit AA-body 4.5:1.
  {
    fg: "cinnabar-on-paper",
    bg: "paper",
    tier: "body",
    note: "Cinnabar body/caption text on paper",
  },

  // Darker ochre variant — used for MDX eyebrow labels (Упражнение, Проверка)
  // at caption size. Brand ochre is a yellow display accent and unusable for
  // body text; this variant reads as burnt amber and clears AA-body.
  {
    fg: "ochre-on-paper",
    bg: "paper",
    tier: "body",
    note: "Ochre body/caption text on paper",
  },

  // Editorial cream text on the synthesis cinnabar band. The band carries
  // both display text (h2, body-l description ≥19px) AND a text-caption
  // "Итог" label, so we audit at the stricter body tier.
  //
  // Dark mode tension noted in plan §15 (dark cinnabar must read as bright,
  // cream stays cream invariant). The dark variant is excluded from the
  // gate; tracked in plan, accepted compromise for now.
  {
    fg: "paper-on-accent",
    bg: "cinnabar",
    tier: "body",
    themes: ["light"],
    note: "Cream on cinnabar band (light only — dark needs design fix)",
  },
];

// --- CSS parsing ----------------------------------------------------------

type Block = { theme: Theme; tokens: Map<string, string> };

function parseGlobalsCss(css: string): Block[] {
  // Strip comments — they otherwise leak braces / colons that confuse the
  // section walker.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");

  const blocks: Block[] = [];

  const lightStart = stripped.indexOf(":root {");
  if (lightStart < 0) throw new Error("globals.css: :root block not found");
  blocks.push({
    theme: "light",
    tokens: extractTokens(extractBlock(stripped, lightStart)),
  });

  const darkMatch = stripped.match(/:root\.dark\s*,\s*\.dark\s*\{/);
  if (!darkMatch || typeof darkMatch.index !== "number") {
    throw new Error("globals.css: dark block not found");
  }
  blocks.push({
    theme: "dark",
    tokens: extractTokens(extractBlock(stripped, darkMatch.index)),
  });

  return blocks;
}

function extractBlock(source: string, openIdx: number): string {
  // Find the first `{` from openIdx, then walk braces until the matching `}`.
  const braceStart = source.indexOf("{", openIdx);
  if (braceStart < 0) return "";
  let depth = 1;
  let i = braceStart + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return source.slice(braceStart + 1, i - 1);
}

function extractTokens(blockBody: string): Map<string, string> {
  const tokens = new Map<string, string>();
  // Match `--name: value;` ending at the next semicolon. Multi-line OK.
  const re = /--([a-z][a-z0-9-]*)\s*:\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(blockBody)) !== null) {
    tokens.set(m[1]!, m[2]!.trim());
  }
  return tokens;
}

// --- Resolve token → OKLCH Color via culori --------------------------------

function resolveColor(name: string, tokens: Map<string, string>): Color {
  const value = tokens.get(name);
  if (!value) throw new Error(`Unknown token --${name}`);
  // Token may be a `var(--other)` indirection.
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (ref) return resolveColor(ref[1]!, tokens);
  const parsed = parse(value);
  if (!parsed) throw new Error(`Could not parse colour --${name}: ${value}`);
  return parsed;
}

// --- WCAG 2.1 contrast ratio ----------------------------------------------

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const transform = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = transform(rgb.r);
  const g = transform(rgb.g);
  const b = transform(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number },
): number {
  const lf = relativeLuminance(fg);
  const lb = relativeLuminance(bg);
  const [light, dark] =
    lf > lb ? ([lf, lb] as const) : ([lb, lf] as const);
  return (light + 0.05) / (dark + 0.05);
}

// --- Composite alpha foreground over background --------------------------

function composite(
  fg: { r: number; g: number; b: number; alpha?: number },
  bg: { r: number; g: number; b: number },
): { r: number; g: number; b: number } {
  const a = fg.alpha ?? 1;
  return {
    r: bg.r + (fg.r - bg.r) * a,
    g: bg.g + (fg.g - bg.g) * a,
    b: bg.b + (fg.b - bg.b) * a,
  };
}

// --- Audit ---------------------------------------------------------------

const toRgb = converter("rgb");

type Result = {
  pair: Pair;
  theme: Theme;
  ratio: number;
  fgHex: string;
  bgHex: string;
  ok: boolean;
};

function audit(): Result[] {
  const css = fs.readFileSync(CSS_PATH, "utf8");
  const blocks = parseGlobalsCss(css);
  const results: Result[] = [];

  for (const { theme, tokens } of blocks) {
    for (const pair of PAIRS) {
      if (pair.themes && !pair.themes.includes(theme)) continue;
      const fgColor = resolveColor(pair.fg, tokens);
      const bgColor = resolveColor(pair.bg, tokens);
      const fgRgb = toRgb(fgColor);
      const bgRgb = toRgb(bgColor);
      if (!fgRgb || !bgRgb) {
        throw new Error(
          `Could not convert tokens to sRGB for pair ${pair.fg}/${pair.bg}`,
        );
      }
      const composedFg = pair.alphaOver
        ? composite(
            { r: fgRgb.r, g: fgRgb.g, b: fgRgb.b, alpha: fgRgb.alpha },
            (() => {
              const overColor = resolveColor(pair.alphaOver!, tokens);
              const overRgb = toRgb(overColor);
              if (!overRgb) throw new Error(`alphaOver fail`);
              return { r: overRgb.r, g: overRgb.g, b: overRgb.b };
            })(),
          )
        : { r: fgRgb.r, g: fgRgb.g, b: fgRgb.b };
      const ratio = contrastRatio(composedFg, {
        r: bgRgb.r,
        g: bgRgb.g,
        b: bgRgb.b,
      });
      const required = pair.tier === "body" ? 4.5 : 3.0;
      results.push({
        pair,
        theme,
        ratio,
        fgHex: formatHex(fgColor) ?? "?",
        bgHex: formatHex(bgColor) ?? "?",
        ok: ratio >= required,
      });
    }
  }

  return results;
}

function main(): void {
  const results = audit();
  const failures = results.filter((r) => !r.ok);

  console.log(`Contrast audit · ${results.length} checks`);
  console.log(
    [
      "theme".padEnd(6),
      "pair".padEnd(36),
      "tier".padEnd(6),
      "ratio".padStart(7),
      "min".padStart(5),
      "result",
    ].join("  "),
  );
  for (const r of results) {
    const required = r.pair.tier === "body" ? 4.5 : 3.0;
    const pairLabel = `${r.pair.fg} on ${r.pair.bg}${
      r.pair.alphaOver ? ` (over ${r.pair.alphaOver})` : ""
    }`;
    console.log(
      [
        r.theme.padEnd(6),
        pairLabel.padEnd(36),
        r.pair.tier.padEnd(6),
        r.ratio.toFixed(2).padStart(7),
        required.toFixed(1).padStart(5),
        r.ok ? "✓" : "✗ FAIL",
      ].join("  "),
    );
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} failure(s).`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} pairs pass.`);
}

main();
