// Konfigurasi Playwright untuk integration test (IT) dan system test (ST).
// Semua skenario berjalan serial karena berbagi satu database uji.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 15 * 60_000,
  expect: { timeout: 30_000 },
  outputDir: "./hasil/artefak",
  reporter: [
    ["list"],
    ["json", { outputFile: "./hasil/results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 60_000,
    navigationTimeout: 120_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
