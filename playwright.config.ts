import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: process.env.APP_BASE_URL || "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
    locale: "de-DE",
    timezoneId: "Europe/Berlin"
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
