import { test, expect } from "@playwright/test";

test.describe("Public routes", () => {
  test("homepage loads with wordmark and 4 track rows", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Wordmark contains the three words; they render as sibling spans.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("forma", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("functio", { exact: false }).first()).toBeVisible();

    // 4 track rows — each is a <h2> inside a link.
    const trackHeadings = page.locator("section[aria-label=\"Треки\"] h2");
    await expect(trackHeadings).toHaveCount(4);
  });

  test("track page loads with lesson list", async ({ page }) => {
    const response = await page.goto("/lessons/foundations");
    expect(response?.status()).toBe(200);
    // h1 shows the Russian track title.
    await expect(page.getByRole("heading", { level: 1, name: "Основы" })).toBeVisible();
    // At least one lesson row renders.
    await expect(page.locator("ul li").first()).toBeVisible();
  });

  test("topic page renders MDX with drop cap", async ({ page }) => {
    const response = await page.goto(
      "/lessons/foundations/typography/01-anatomy",
    );
    expect(response?.status()).toBe(200);
    // Section label for the reading band is stable.
    await expect(page.getByLabel("Основной текст")).toBeVisible();
    // Drop cap is a floated span with the cinnabar text colour. There's
    // also at least one quiz on this topic (Quiz about x-height).
    const hasDropCap = await page.locator("span.float-left.text-cinnabar").count();
    const hasQuizMatter = await page.getByText("x-height").count();
    expect(hasDropCap + hasQuizMatter).toBeGreaterThan(0);
  });
});
