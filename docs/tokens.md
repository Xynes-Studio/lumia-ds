# Tokens & Theming

This guide describes the architecture, workflow, and usage of design tokens in the Lumia Design System.

## Architecture

We use a two-tiered token architecture:

1.  **Core Tokens** (`tokens/core/*.json`):
    -   Primitive values (blue-500, spacing-4, etc.)
    -   *Do not use these directly in the UI if a semantic token exists.*

2.  **Semantic Tokens** (`tokens/semantic/*.json`):
    -   Context-aware names (color-primary, color-bg, radius-md)
    -   These map to core tokens and define the "intent".
    -   *Use these in your components.*

### Token Layering
`Core Tokens` -> `Semantic Tokens` -> `Platform Assets (CSS/TS)` -> `Components`

## Workflow

### Adding or Editing a Token

1.  **Locate the Token File**:
    -   Core colors: `packages/tokens/tokens/core/colors.json`
    -   Semantic colors: `packages/tokens/tokens/semantic/colors.json`
    -   Typography, spacing, etc.: corresponding files in `packages/tokens/tokens/core/`

2.  **Edit the JSON**:
    Follow the [W3C Design Token format](https://design-tokens.github.io/community-group/format/).
    ```json
    "primary": {
      "value": "{color.blue.600}",
      "type": "color"
    }
    ```

3.  **Build Tokens**:
    Run the build command from the root or `packages/tokens` directory:
    ```bash
    pnpm build:tokens
    ```
    This generates:
    -   `packages/tokens/dist/css/variables.css` (CSS Variables)
    -   `packages/tokens/dist/ts/tokens.ts` (TypeScript Constants)

4.  **Verify**:
    Check the generated files to ensure your token is present.

## Usage Guide

### 1. In Tailwind CSS

The tokens are automatically mapped to the Tailwind configuration via our preset.

**Configuration:**
Our Tailwind preset (`packages/theme/src/tailwind/tailwind.ts`) maps semantic tokens to Tailwind utilities.

**Usage in HTML/React:**
```tsx
// Using semantic class names
<div className="bg-background text-foreground border-border rounded-md">
  <h1 className="text-primary">Hello World</h1>
</div>
```

### 2. In React Components (CSS-in-JS / Style Objects)

You can import the generated CSS variables file once in your app root, or use the TypeScript constants if you need the raw values in JS.

**CSS Variables Support:**
Ensure `@lumia/tokens/dist/css/variables.css` is imported in your global CSS or main entry file.

```tsx
// main.tsx
import '@lumia/tokens/dist/css/variables.css';
```

**TypeScript Constants:**
```ts
import { ColorPrimary } from '@lumia/tokens';

const styles = {
  backgroundColor: ColorPrimary, // Returns result of var(--color-primary, #...)
};
```

### 3. In CSS Files

Use standard CSS variables.

```css
.my-component {
  background-color: var(--color-surface);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

## Testing & Validation

-   **Unit Tests**: `pnpm test` in `packages/tokens` runs regression tests on generated assets.
-   **Storybook**: Check the "Tokens" or "Theme" story to verify visual output (if applicable).

