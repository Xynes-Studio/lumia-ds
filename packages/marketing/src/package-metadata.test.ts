import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  exports?: Record<string, unknown>;
  sideEffects?: boolean | string[];
};

describe('package metadata', () => {
  it('exports the bundled marketing stylesheet as a public package subpath', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(cwd(), 'package.json'), 'utf8'),
    ) as PackageJson;

    expect(packageJson.exports).toEqual(
      expect.objectContaining({
        './styles.css': './dist/index.css',
      }),
    );
    expect(packageJson.sideEffects).toContain('**/*.css');
  });
});
