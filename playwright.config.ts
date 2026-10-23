import { defineConfig, devices } from "@playwright/test";

/** Browser regressions use mocked API data and an owned development server. */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 90000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3108",
    trace: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: {
    command: "yarn next dev --hostname 127.0.0.1 --port 3108",
    url: "http://127.0.0.1:3108",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
