import { existsSync } from "fs";
import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3100";
const baseURL = `http://localhost:${PORT}`;

// Only some sandboxed dev environments pre-install a bare "chromium" binary
// at this fixed path (and need it explicitly pointed to, since their
// Playwright version otherwise resolves to a "headless shell" variant that
// isn't present there). CI and normal local setups install their own
// matching browser via `playwright install` and must use Playwright's
// default resolution instead — hardcoding this path unconditionally broke
// exactly that (see CI run failure: "executable doesn't exist at
// /opt/pw-browsers/chromium"). Detect rather than assume.
const SANDBOX_CHROMIUM_PATH = "/opt/pw-browsers/chromium";
const chromiumLaunchOptions = existsSync(SANDBOX_CHROMIUM_PATH)
  ? { executablePath: SANDBOX_CHROMIUM_PATH }
  : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shared DB / seeded users — avoid cross-test interference
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  // Server actions here do a real Postgres round trip (advisory lock +
  // transaction + revalidate) before the page settles — the 5s default is
  // tight for that under load, so give assertions a bit more room.
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(chromiumLaunchOptions ? { launchOptions: chromiumLaunchOptions } : {}),
      },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT, AUTH_TRUST_HOST: "true" },
  },
});
