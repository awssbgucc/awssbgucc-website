import { defineConfig } from '@playwright/test';

// Runs against a production build: the production-only checks in e2e/prod, and the shared flows in e2e/dev, so
// motion, routing and the member journeys are proved on the code that ships. e2e/dev-only is left out: those pages
// return 404 in production, which e2e/prod checks. One worker, like the dev run, for this laptop's memory.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['prod/**/*.spec.ts', 'dev/**/*.spec.ts'],
  testIgnore: ['**/dev-only/**'],
  timeout: 120_000,
  workers: 1,
  use: { baseURL: 'http://localhost:3211' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'pnpm exec next build && pnpm exec next start -p 3211',
    port: 3211,
    reuseExistingServer: false,
    timeout: 600_000,
  },
});
