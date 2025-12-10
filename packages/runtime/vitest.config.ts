import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@lumia-ui/components': resolve(__dirname, '../components/src'),
      '@lumia-ui/forms': resolve(__dirname, '../forms/src'),
      '@lumia-ui/layout': resolve(__dirname, '../layout/src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx'],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
  },
});
