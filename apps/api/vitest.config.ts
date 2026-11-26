import * as dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '../../.env' });

if (process.env.DATABASE_URL?.includes('@postgres:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@postgres:5432', '@localhost:5433');
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      concurrent: false,
    },
    deps: {
      interOpDefault: true,
    },
  },
});
