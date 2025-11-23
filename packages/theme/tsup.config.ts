import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
        entry: 'src/index.ts',
        tsconfig: './tsconfig.json',
    },
    clean: true,
    sourcemap: true,
    tsconfig: './tsconfig.json',
});
