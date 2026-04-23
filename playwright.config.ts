import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — plan §23 Phase 7.
 *
 * Assumes the Next dev server is already running at http://localhost:3000.
 * Tests are critical-path smoke tests only; no visual regression here.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "ru-RU",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
