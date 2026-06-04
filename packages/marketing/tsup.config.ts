import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  banner: {
    js: '"use client";',
  },
  dts: {
    entry: 'src/index.ts',
    tsconfig: './tsconfig.json',
  },
  clean: true,
  sourcemap: true,
  tsconfig: './tsconfig.json',
  external: ['react', 'react-dom', '@lumia-ui/components'],
});
