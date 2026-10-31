import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// The CLI uses Neon's direct connection. The app uses the pooled one, in src/lib/db.ts.
// The empty fallback lets `prisma generate` run where no database is configured.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? '',
  },
});
