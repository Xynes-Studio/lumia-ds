import process from 'node:process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesPath = resolve(process.cwd(), 'src/styles.css');
const styles = readFileSync(stylesPath, 'utf8');

describe('editor dark theme styles', () => {
  it('defines a dark-mode surface and text treatment for the editor shell', () => {
    expect(styles).toContain('@media (prefers-color-scheme: dark)');
    expect(styles).toContain('.editor-container');
    expect(styles).toContain('.editor-input');
    expect(styles).toContain('var(--editor-surface-dark');
    expect(styles).toContain('var(--editor-text-dark');
  });

  it('defines dark-mode surfaces for floating menus', () => {
    expect(styles).toContain('.slash-menu');
    expect(styles).toContain('.table-action-menu');
    expect(styles).toContain('var(--editor-popover-surface-dark');
    expect(styles).toContain('var(--editor-popover-border-dark');
  });
});
