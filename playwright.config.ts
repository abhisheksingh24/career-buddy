import { defineConfig } from "@playwright/test";

// Accessibility checks (issue #42, ADR 0012). They run against the production
// build (`npm run build` first) started with throwaway settings: no database is
// contacted for the public pages, and AI is in mock mode.
const PORT = Number(process.env.A11Y_PORT ?? 3917);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { browserName: "chromium", viewport: { width: 375, height: 667 } } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/auth/providers`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NODE_ENV: "production",
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET: "a11y-check-secret-not-for-production",
      MOCK_AI_SUGGESTIONS: "true",
      GOOGLE_CLIENT_ID: "a11y-check",
      GOOGLE_CLIENT_SECRET: "a11y-check",
      DATABASE_URL: "postgresql://unused:unused@127.0.0.1:1/unused",
    },
  },
});
