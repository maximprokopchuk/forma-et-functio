import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config — pure-function unit tests only.
 * No happy-dom / jsdom / @testing-library: components stay covered by
 * Playwright + axe at runtime. Adding a browser env here would 5× the
 * test runtime for marginal gain.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    reporters: ["verbose"],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
