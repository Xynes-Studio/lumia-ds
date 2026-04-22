import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  dependencies?: Record<string, string>;
};

describe('package metadata', () => {
  it('declares the Lexical runtime dependencies required by rich-text', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(cwd(), 'package.json'), 'utf8'),
    ) as PackageJson;

    expect(packageJson.dependencies).toEqual(
      expect.objectContaining({
        '@lexical/clipboard': '0.38.2',
        '@lexical/dragon': '0.38.2',
        '@lexical/extension': '0.38.2',
        '@lexical/html': '0.38.2',
        '@lexical/text': '0.38.2',
        '@preact/signals-core': '^1.12.1',
        prismjs: '^1.30.0',
        'react-error-boundary': '^6.0.0',
      }),
    );
  });
});
