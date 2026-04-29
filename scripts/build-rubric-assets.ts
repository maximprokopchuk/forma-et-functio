#!/usr/bin/env tsx
/**
 * Convert content/rubrics/svg/*.svg → public/assets/rubric/*.png
 *
 * The PNGs are referenced from rubric YAML `reference_examples` and embedded
 * into the multimodal grading prompt as image URLs. SVG is the source of
 * truth (small, editable, version-controllable); PNG is the build product
 * because Anthropic / OpenAI vision endpoints accept raster images only.
 *
 * Run:
 *   pnpm run build:rubric-assets
 *
 * Idempotent — safe to re-run; skips files that haven't changed.
 */

import { Resvg } from "@resvg/resvg-js";
import * as fs from "node:fs";
import * as path from "node:path";

const SRC = path.join(process.cwd(), "content", "rubrics", "svg");
const OUT = path.join(process.cwd(), "public", "assets", "rubric");

// 2x density for retina-grade source — Anthropic / OpenAI vision pipelines
// downscale anyway, but a sharper start gives better reference grounding.
const SCALE = 2;

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function svgToPng(svgPath: string, pngPath: string): { wrote: boolean; bytes: number } {
  const svg = fs.readFileSync(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: SCALE },
    background: "transparent",
    font: {
      // Default system fonts — `resvg-js` uses fontconfig under the hood;
      // missing fonts substitute to a Sans fallback. Acceptable for our
      // deliberately-minimal SVG mocks.
      loadSystemFonts: true,
    },
  });
  const png = resvg.render().asPng();

  // Skip if identical content already on disk — keeps git diff quiet.
  if (fs.existsSync(pngPath)) {
    const existing = fs.readFileSync(pngPath);
    if (existing.equals(png)) {
      return { wrote: false, bytes: png.byteLength };
    }
  }
  fs.writeFileSync(pngPath, png);
  return { wrote: true, bytes: png.byteLength };
}

function main(): void {
  ensureDir(OUT);
  if (!fs.existsSync(SRC)) {
    console.error(`No source dir: ${SRC}`);
    process.exit(1);
  }
  const entries = fs
    .readdirSync(SRC)
    .filter((f) => /\.svg$/i.test(f))
    .sort();

  if (entries.length === 0) {
    console.warn("No SVGs found.");
    return;
  }

  console.log(`Converting ${entries.length} SVG(s):`);
  let writtenCount = 0;
  for (const entry of entries) {
    const src = path.join(SRC, entry);
    const out = path.join(OUT, entry.replace(/\.svg$/i, ".png"));
    const { wrote, bytes } = svgToPng(src, out);
    const flag = wrote ? "✓ wrote" : "= unchanged";
    console.log(`  ${flag} ${path.basename(out)} (${(bytes / 1024).toFixed(1)} KB)`);
    if (wrote) writtenCount++;
  }
  console.log(
    `Done. ${writtenCount}/${entries.length} written, ${entries.length - writtenCount} unchanged.`,
  );
}

main();
