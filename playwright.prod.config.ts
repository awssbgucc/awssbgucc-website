import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/prod',
  use: { baseURL: 'http://localhost:3211' },
  webServer: {
    command: 'pnpm exec next build && pnpm exec next start -p 3211',
    port: 3211,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
