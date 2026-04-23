// Capture /widgets showcase in light and dark, for Phase 3 audit.
// Run: `node scripts/audit-widgets.mjs`
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "docs/design-audit";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: theme,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t);
      } catch {}
    }, theme);

    try {
      await page.goto("http://localhost:3000/widgets", {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      // Scroll through so lazy-loaded widgets hydrate before the screenshot.
      await page.evaluate(async () => {
        const height = document.body.scrollHeight;
        for (let y = 0; y < height; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      // Give the last dynamic imports time to resolve, then scroll once
      // more so any widget instantiated during scroll has rendered.
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.addStyleTag({
        content: `
          nextjs-portal, [data-next-mark], #__next-build-watcher,
          #__next-prerender-indicator, [data-nextjs-toast],
          [data-nextjs-dialog-overlay], [data-nextjs-dialog] {
            display: none !important;
          }
        `,
      });
      const file = path.join(OUT_DIR, `widgets-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`[ok] ${file}`);
    } catch (err) {
      console.error(`[fail] ${theme}: ${err.message}`);
    }
    await context.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
