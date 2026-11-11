import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Database tests for the award engine. They write data, so they run only against a local database:
// the setup file refuses anything else. See tasks/todo.md for how to start one.
export default defineConfig({
  resolve: {
    alias: {
      '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.int.test.ts'],
    setupFiles: ['src/test/local-db-only.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
