// Detailed screenshots for specific regions
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const OUT_DIR =
  process.argv[2] === "after"
    ? "docs/design-audit/after"
    : "docs/design-audit/before";

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

    // Topic page — hero band
    await page.goto(
      "http://localhost:3000/lessons/foundations/typography/01-anatomy",
      { waitUntil: "networkidle" },
    );
    await page.addStyleTag({
      content: `nextjs-portal, [data-next-mark] { display:none !important; }`,
    });
    await page.waitForTimeout(400);

    // Hero band only (viewport height)
    await page.screenshot({
      path: `${OUT_DIR}/topic-hero-${theme}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });

    const fullHeight = await page.evaluate(() => document.body.scrollHeight);

    // Reading band — scroll and capture
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${OUT_DIR}/topic-reading-${theme}.png`,
      fullPage: false,
    });

    // Mid-body with quiz/exercise
    await page.evaluate(() => window.scrollTo(0, 3200));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${OUT_DIR}/topic-midbody-${theme}.png`,
      fullPage: false,
    });

    // Synthesis band — scroll so the cinnabar band fills the viewport
    await page.evaluate(
      (h) => window.scrollTo(0, Math.max(0, h - window.innerHeight)),
      fullHeight,
    );
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${OUT_DIR}/topic-synthesis-${theme}.png`,
      fullPage: false,
    });

    await context.close();
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
