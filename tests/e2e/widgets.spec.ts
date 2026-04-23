import { test, expect } from "@playwright/test";

test.describe("Widgets showcase", () => {
  test("/widgets shows all 5 widget titles", async ({ page }) => {
    await page.goto("/widgets");
    await expect(page.getByRole("heading", { level: 1, name: "Виджеты" })).toBeVisible();

    // Each widget is wrapped in an <Exercise title="…"> component;
    // the title text is the label to assert.
    const expected = [
      "Иерархия и порядок чтения",
      "Контраст цвета",
      "Пара шрифтов",
      "Пространство и ритм",
      "Симулятор доступности",
    ];
    for (const label of expected) {
      // Scroll-into-view so LazyMount hydrates before the check.
      const heading = page.getByText(label, { exact: false }).first();
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
    }
  });

  test("ColorContrastSandbox exposes a WCAG ratio", async ({ page }) => {
    await page.goto("/widgets");
    const contrast = page.getByText("Контраст цвета").first();
    await contrast.scrollIntoViewIfNeeded();
    await expect(contrast).toBeVisible();

    // The widget renders the literal text "WCAG" and a numeric ratio; be
    // permissive about the exact format.
    await expect(page.getByText(/WCAG/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/\d+(?:[.,]\d+)?\s*:\s*1/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("HierarchyReorder exposes a check control", async ({ page }) => {
    await page.goto("/widgets");
    const reorder = page.getByText("Иерархия и порядок чтения").first();
    await reorder.scrollIntoViewIfNeeded();

    // The widget renders a button labelled "Проверить".
    await expect(
      page.getByRole("button", { name: /Проверить/ }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
