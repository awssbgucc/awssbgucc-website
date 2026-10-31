import { defineConfig } from '@playwright/test';

// Runs against the dev server. The production checks live in playwright.prod.config.ts,
// because next dev and next build share the .next folder and cannot run together.
export default defineConfig({
  testDir: './e2e/dev',
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
