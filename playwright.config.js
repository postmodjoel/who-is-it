import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 4173);

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure"
  },
  webServer: {
    // node directly (not `npm run`): the test box may have a bare node runtime with no npm on PATH.
    command: `PORT=${port} node tools/static-server.mjs`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 980 } } },
    { name: "iphone", use: { ...devices["iPhone 13"] } },
    { name: "tablet", use: { viewport: { width: 900, height: 1180 }, isMobile: true, hasTouch: true } }
  ]
});
