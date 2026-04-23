import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const packageJsonPath = path.resolve(import.meta.dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  dependencies?: Record<string, string>;
};

describe('components package metadata', () => {
  it('does not declare unused transitive radix/remove-scroll internals as direct deps', () => {
    expect(packageJson.dependencies).not.toHaveProperty('@radix-ui/number');
    expect(packageJson.dependencies).not.toHaveProperty('use-sidecar');
  });
});
