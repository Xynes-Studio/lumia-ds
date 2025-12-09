# Tokens & Theming Engine

We use [Style Dictionary](https://amzn.github.io/style-dictionary/) as the core token engine.
Tokens are defined in JSON files within `packages/tokens/tokens/` and transformed into platform-specific assets.

## Source of Truth

The single source of truth for design tokens are the JSON files located in `packages/tokens/tokens/core/`.

- `colors.json`: Color palette
- `spacing.json`: Spacing scale
- `typography.json`: Font families, weights, and sizes

## Generated Assets

Running `pnpm build:tokens` (or `pnpm build`) in `@lumia/tokens` generates:

1.  **CSS Variables**: `dist/css/variables.css` (exported as `@lumia/tokens/dist/css/variables.css`)
    - Usage: `import '@lumia/tokens/dist/css/variables.css'`
    - Usage in CSS: `var(--color-primary-500)`
2.  **TypeScript Constants**: `dist/ts/tokens.ts` (and `src/generated/tokens.ts`)
    - Usage: `import { ColorPrimary } from '@lumia/tokens'`

## Contributing

To add or modify a token:

1.  Edit the valid JSON file in `tokens/core/`.
2.  Run `pnpm build:tokens`.
3.  Commit the changes.

> [!NOTE]
> Do not edit generated files in `dist/` or `src/generated/` directly.
