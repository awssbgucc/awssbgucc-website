import { defineConfig } from '@playwright/test';

// Runs against the dev server: the shared flows in e2e/dev, plus e2e/dev-only, which needs pages that exist only
// under next dev (the styleguide). The same flows also run on the production build in playwright.prod.config.ts,
// a separate run because next dev and next build share the .next folder and cannot run together.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['dev/**/*.spec.ts', 'dev-only/**/*.spec.ts'],
  testIgnore: ['**/prod/**'],
  // The first visit to each route compiles it in next dev, which takes over 30 seconds on a slow laptop.
  timeout: 120_000,
  workers: 1,
  use: { baseURL: 'http://localhost:3210' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'pnpm exec next dev -p 3210',
    url: 'http://localhost:3210/styleguide',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
