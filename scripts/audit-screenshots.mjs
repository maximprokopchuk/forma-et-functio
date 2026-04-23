// Capture screenshots of key routes in both light and dark mode.
// Run: `node scripts/audit-screenshots.mjs <before|after>`

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR =
  process.argv[2] === "after"
    ? "docs/design-audit/after"
    : "docs/design-audit/before";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/lessons/foundations", name: "track" },
  {
    path: "/lessons/foundations/typography/01-anatomy",
    name: "topic",
  },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const theme of ["light", "dark"]) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      // Force theme through localStorage (next-themes reads this key)
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t);
        } catch {}
      }, theme);

      for (const route of ROUTES) {
        const url = `http://localhost:3000${route.path}`;
        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
          // Give fonts and next-themes one frame to settle
          await page.waitForTimeout(500);
          // Hide Next.js dev indicators for cleaner screenshots
          await page.addStyleTag({
            content: `
              nextjs-portal, [data-next-mark], #__next-build-watcher,
              #__next-prerender-indicator, [data-nextjs-toast],
              [data-nextjs-dialog-overlay], [data-nextjs-dialog] {
                display: none !important;
              }
            `,
          });
          const file = path.join(
            OUT_DIR,
            `${route.name}-${theme}-${vp.name}.png`,
          );
          await page.screenshot({ path: file, fullPage: true });
          console.log(`[ok] ${file}`);
        } catch (err) {
          console.error(`[fail] ${url}: ${err.message}`);
        }
      }
      await context.close();
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
