const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/storybook-static/**',
      'packages/icons/src/generated/**',
      'packages/tokens/src/generated/**',
      '.pnpm-store/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/.storybook/**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['packages/cli/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['packages/cli/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
  /**
   * BUG-UNIVERSAL — ban bare `<div onClick>` / `<span onClick>` etc. inside
   * the Lumia DS source tree. Interactive surfaces must be real `<button>` /
   * `<a>` elements (or a Lumia primitive that wraps one) so they inherit the
   * `interactiveCursor` contract plus the usual button a11y semantics
   * (focusability, Enter/Space activation, role).
   *
   * Scope: source files only. Tests and stories are excluded because they
   * frequently mount native HTML elements as fixtures.
   *
   * Allowlist (covered by file-scoped overrides if needed): the Combobox
   * outer `<div onClick>` that re-focuses the inner input is the canonical
   * exception in the package today; if a future primitive needs the same
   * pattern, refactor through a real `<button>` or add a targeted disable
   * comment with a justification.
   */
  {
    files: [
      'packages/components/src/**/*.{ts,tsx}',
      'packages/layout/src/**/*.{ts,tsx}',
      'packages/editor/src/**/*.{ts,tsx}',
    ],
    ignores: [
      '**/*.test.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
      // Pre-existing patterns that are intentionally not real buttons:
      //   - Combobox multi-select trigger wraps an <input> and uses onClick
      //     only to refocus the input.
      //   - Drawer / FileUpload / EntityTile use the `role="button"` +
      //     `tabIndex={0}` + onKeyDown pattern to make a non-button container
      //     keyboard-accessible without forcing a real <button> wrapper. They
      //     pre-date the BUG-UNIVERSAL guard; refactoring them is out of
      //     scope for this story.
      //   - StatusNodePopover trigger + VideoBlockComponent click-capture
      //     overlay + video container use the same aria-button-ish pattern
      //     inside the editor package.
      'packages/components/src/combobox/combobox.tsx',
      'packages/components/src/drawer/drawer.tsx',
      'packages/components/src/entity-tile/entity-tile.tsx',
      'packages/components/src/file-upload/file-upload.tsx',
      'packages/editor/src/nodes/StatusNode/StatusNodePopover.tsx',
      'packages/editor/src/nodes/VideoBlockNode/VideoBlockComponent.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^(div|span|li|tr|td|section|header|footer)$/] > JSXAttribute[name.name='onClick']",
          message:
            'Bare onClick on a non-interactive HTML element is forbidden in Lumia DS. Use Button, a styled <a>, or another Lumia primitive — they carry the cursor + a11y contract documented in packages/components/README.md "Interactive cursor contract".',
        },
      ],
    },
  },
  /**
   * LP-DS — `no-inline-xynes-brand`: forbid importing or inlining any SVG
   * matching `xynes-(icon|wordmark)` outside `@lumia-ui/components/src/brand`.
   * Use `<Brand variant="wordmark" | "icon" />` instead.
   *
   * The rule is implemented as two `no-restricted-syntax` selectors:
   *   1. Imports — any `import … from '...xynes-(icon|wordmark)...'`.
   *   2. Inline literals — any string literal mentioning the brand asset
   *      filename (catches `require('xynes-icon.svg')`, fetch URLs, etc.).
   *
   * Scope: every package in the workspace EXCEPT
   * `packages/components/src/brand/` (the only sanctioned home for the SVG)
   * AND test/stories files (consumers may render the asset directly in test
   * fixtures or storybook composition).
   */
  {
    files: ['packages/**/*.{ts,tsx}'],
    ignores: [
      'packages/components/src/brand/**',
      '**/*.test.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ImportDeclaration[source.value=/xynes-(icon|wordmark)\\.svg$/]",
          message:
            "Importing the Xynes brand SVG directly is forbidden (LP-DS no-inline-xynes-brand). Use <Brand variant='wordmark' | 'icon' /> from @lumia-ui/components instead.",
        },
        {
          selector:
            "Literal[value=/xynes-(icon|wordmark)\\.svg/]",
          message:
            "Inlining the Xynes brand asset filename is forbidden (LP-DS no-inline-xynes-brand). Use <Brand /> from @lumia-ui/components instead.",
        },
      ],
    },
  },
];
