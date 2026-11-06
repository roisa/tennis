import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const env = {
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  LOCAL_DATA_FILE: ".data/e2e.json",
  ADMIN_AUTH_PROVIDER: "password",
  ADMIN_EMAILS: "editor@courtscape.example",
  ADMIN_PASSWORD: "e2e-password",
  ADMIN_SESSION_SECRET: "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
  PAYMENT_PROVIDER: "test",
  // Set E2E_DATABASE_URL (local Postgres) to run the suite against PostgresStore instead of the JSON store.
  DATABASE_URL: process.env.E2E_DATABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_URL: "",
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    command: `${process.env.E2E_DATABASE_URL ? "npx tsx scripts/db-reset-local.ts" : "rm -f .data/e2e.json"} && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env,
  },
});
