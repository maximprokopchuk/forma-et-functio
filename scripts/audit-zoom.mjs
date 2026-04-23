// Focused zoom on first paragraph + drop-cap.
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

    await page.goto(
      "http://localhost:3000/lessons/foundations/typography/01-anatomy",
      { waitUntil: "networkidle" },
    );
    await page.addStyleTag({
      content: `nextjs-portal, [data-next-mark] { display:none !important; }`,
    });
    await page.waitForTimeout(300);

    // Scroll so drop-cap is near top of viewport
    await page.evaluate(() => window.scrollTo(0, 820));
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${OUT_DIR}/zoom-dropcap-${theme}.png`,
      clip: { x: 0, y: 0, width: 1200, height: 500 },
    });

    await context.close();
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
