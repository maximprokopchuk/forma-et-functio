import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility regression tests — plan §13.
 * Fails on `critical` or `serious` violations only. Lower severities are
 * tracked separately in nightly Pa11y runs (not gated here).
 *
 * Routes covered: homepage, track index, one topic page. These three exercise
 * the canonical layouts (hero band, lesson list, three-band reading). New
 * routes should be added here when they ship.
 */

const BLOCKING_IMPACTS = ["critical", "serious"] as const;

async function expectClean(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  const blocking = result.violations.filter((v) =>
    BLOCKING_IMPACTS.includes(v.impact as (typeof BLOCKING_IMPACTS)[number]),
  );
  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => `[${v.impact}] ${v.id}: ${v.help} (nodes: ${v.nodes.length})`)
      .join("\n");
    throw new Error(`Axe found ${blocking.length} blocking violations:\n${summary}`);
  }
  expect(blocking).toHaveLength(0);
}

test.describe("Accessibility — axe", () => {
  test("homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectClean(page);
  });

  test("track index", async ({ page }) => {
    await page.goto("/lessons/foundations");
    await page.waitForLoadState("networkidle");
    await expectClean(page);
  });

  test("topic page", async ({ page }) => {
    await page.goto("/lessons/foundations/typography/01-anatomy");
    await page.waitForLoadState("networkidle");
    await expectClean(page);
  });
});
