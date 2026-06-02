#!/usr/bin/env bun
/**
 * BUG-LDS-6 — Icon source audit.
 *
 * Scans the panel-block + panel-toolbar surfaces of `@lumia-ui/editor` and
 * fails if any file imports an icon component directly from `lucide-react`.
 * Every editor panel surface MUST consume icons via `<Icon name="..." />`
 * from `@lumia-ui/icons` (UXR-3 icon-purpose registry contract).
 *
 * Pattern matches the STORAGE-FU-1 `db:check` drift gate.
 *
 * Usage:
 *   bun packages/editor/scripts/audit-icon-sources.ts
 *   pnpm --filter @lumia-ui/editor audit:icons
 *
 * Exits 0 on success; exits 1 (with a per-file diff) on violation.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import process from 'node:process';

const REPO_ROOT = resolve(import.meta.dir, '..', '..', '..');

/**
 * The closed list of panel-related source files the audit guards.
 *
 * Scope is deliberately narrow per BUG-LDS-6 plan §3.1 — only the panel-block
 * surface migrated in this ticket. The broader `lucide-react` → Lumia
 * migration for the rest of the editor is tracked by UXR-3.
 */
const GUARDED_FILES = [
  'packages/editor/src/components/Toolbar/PanelToolbarButton.tsx',
  'packages/editor/src/components/Toolbar/PanelToolbarButton.test.tsx',
  'packages/editor/src/plugins/PanelActionMenuPlugin/PanelActionMenuPlugin.tsx',
  'packages/editor/src/plugins/PanelActionMenuPlugin/PanelActionMenuPlugin.test.tsx',
  'packages/editor/src/nodes/PanelBlockNode/PanelBlockNode.ts',
  'packages/editor/src/nodes/PanelBlockNode/PanelBlockInspector.tsx',
  'packages/editor/src/utils/panelActionUtils.ts',
];

/**
 * Forbidden import shape.
 *
 * - `from 'lucide-react'` — direct icon-component import
 * - `require('lucide-react')` — CJS form (rare but possible)
 *
 * We deliberately allow the `LucideIcon` *type* import in NON-panel files
 * (e.g. `InsertBlockMenu.tsx` still types its block-registry icons as
 * `LucideIcon`), but the panel surface above has no remaining reason to
 * import the type either; the audit catches both.
 */
const FORBIDDEN_PATTERNS = [
  /from\s+['"]lucide-react['"]/,
  /require\(\s*['"]lucide-react['"]\s*\)/,
];

interface Violation {
  file: string;
  line: number;
  source: string;
}

function findViolations(absPath: string): Violation[] {
  if (!existsSync(absPath)) return [];

  const violations: Violation[] = [];
  const content = readFileSync(absPath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comments — we want catching import statements, not the
    // explanatory comments that mention the package name.
    const trimmed = line.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*')
    ) {
      return;
    }

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: relative(REPO_ROOT, absPath),
          line: idx + 1,
          source: line,
        });
        break;
      }
    }
  });

  return violations;
}

function main() {
  console.log('BUG-LDS-6: auditing icon sources on panel-block surfaces...');

  const allViolations: Violation[] = [];
  let scanned = 0;
  const missing: string[] = [];

  for (const file of GUARDED_FILES) {
    const abs = resolve(REPO_ROOT, file);
    if (!existsSync(abs)) {
      missing.push(file);
      continue;
    }
    scanned += 1;
    const violations = findViolations(abs);
    allViolations.push(...violations);
  }

  if (missing.length > 0) {
    console.error(
      `ERROR: ${missing.length} guarded file(s) missing from disk:\n` +
        missing.map((f) => `  - ${f}`).join('\n'),
    );
    process.exit(1);
  }

  console.log(`Scanned ${scanned} file(s).`);

  if (allViolations.length === 0) {
    console.log(
      'OK — every panel-block surface consumes icons from @lumia-ui/icons.',
    );
    process.exit(0);
  }

  console.error(
    `\nFAIL — ${allViolations.length} forbidden lucide-react import(s):\n`,
  );
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.source.trim()}`);
  }
  console.error(
    '\nFix: import the Lumia <Icon> component and use a registered icon name.\n' +
      `  import { Icon } from '@lumia-ui/icons';\n` +
      `  <Icon name="info" size="sm" />\n\n` +
      'Available IDs are listed in packages/icons/src/default-icons.ts.\n' +
      'See packages/editor/README.md "Block-panel variants (BUG-LDS-6)".',
  );
  process.exit(1);
}

main();
