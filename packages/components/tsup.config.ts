import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['cjs', 'esm'],
    dts: {
        entry: 'src/index.tsx',
        tsconfig: './tsconfig.json',
    },
    clean: true,
    sourcemap: true,
    tsconfig: './tsconfig.json',
});
