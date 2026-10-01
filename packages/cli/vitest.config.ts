import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.ts',
        'bin/lumia-icon-import.js',
        'bin/lib/svg-import.js',
      ],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
