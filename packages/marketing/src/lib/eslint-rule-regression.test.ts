import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

/**
 * LP-DS — `no-inline-xynes-brand` lint rule regression guard.
 *
 * The rule lives in `eslint.config.js` (workspace root). This test pins:
 *   - the rule's two selectors (import + literal),
 *   - that the rule is scoped to every `packages/**` source file except the
 *     canonical `packages/components/src/brand/**` home and tests/stories,
 *   - that the rule message references `<Brand>` so a developer hitting it
 *     gets pointed at the fix.
 *
 * If a future refactor moves the rule, this test fails until the regression
 * guard is updated to point at the new file. The rule itself was smoke-tested
 * with a hostile fixture during landing — see the LP-DS verification block in
 * the workspace-root `AGENTS.md`.
 */
describe('LP-DS no-inline-xynes-brand ESLint rule', () => {
  // Resolve the workspace root relative to `process.cwd()` (which is the
  // package dir under vitest). Walk up two levels: `packages/marketing/` →
  // `packages/` → workspace root. Avoids `import.meta.url` which the
  // workspace tsconfig (`module: CommonJS`) does not allow.
  const eslintConfigPath = join(process.cwd(), '..', '..', 'eslint.config.js');
  const config = readFileSync(eslintConfigPath, 'utf8');

  it('declares the LP-DS rule block referencing no-inline-xynes-brand by name', () => {
    expect(config).toContain('no-inline-xynes-brand');
  });

  it('scopes the rule to packages/**', () => {
    expect(config).toMatch(/'packages\/\*\*\/\*\.\{ts,tsx\}'/);
  });

  it('excludes the canonical Brand home from the rule', () => {
    expect(config).toContain('packages/components/src/brand/**');
  });

  it('forbids ImportDeclaration of brand SVGs', () => {
    expect(config).toContain('ImportDeclaration');
    expect(config).toMatch(/xynes-\(icon\|wordmark\)/);
  });

  it('forbids inline literal references to brand SVG filenames', () => {
    expect(config).toContain('Literal[value=');
  });

  it('points the developer at <Brand /> in the failure message', () => {
    // Two separate messages (import + literal); both should reference Brand.
    const brandMentions = (config.match(/<Brand/g) ?? []).length;
    expect(brandMentions).toBeGreaterThanOrEqual(2);
  });
});
