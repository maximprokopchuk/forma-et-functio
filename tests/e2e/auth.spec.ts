import { test, expect } from "@playwright/test";

/**
 * Auth critical paths — register flow and protected-route redirect.
 * Register uses a unique email per run so the test is idempotent.
 */
test.describe("Auth", () => {
  test("register creates account and redirects to onboarding", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { level: 1 }).or(page.getByText("РЕГИСТРАЦИЯ")),
    ).toBeVisible();

    const uniq = `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const email = `${uniq}@example.com`;

    await page.getByLabel(/^ИМЯ$/).fill("E2E Тестер");
    await page.getByLabel(/^EMAIL$/).fill(email);
    await page.getByLabel(/^ПАРОЛЬ$/).fill("secret-pass-123");

    await page.getByRole("button", { name: /СОЗДАТЬ АККАУНТ/ }).click();

    // Expect redirect to /onboarding (may take a second for signIn roundtrip).
    await page.waitForURL(/\/onboarding/, { timeout: 15_000 });
    expect(page.url()).toContain("/onboarding");
  });

  test("onboarding redirects unauthenticated users to /login", async ({
    browser,
  }) => {
    // Fresh context — no session cookie.
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.goto("/onboarding");
    // next-auth middleware rewrites to a signin URL; either a 3xx or
    // a final /login URL is acceptable.
    expect(page.url()).toMatch(/\/api\/auth\/signin|\/login/);
    expect(response?.status()).toBeLessThan(500);
    await context.close();
  });
});
