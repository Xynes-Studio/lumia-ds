# @lumia/tokens

Theme tokens for Lumia DS with helpers to emit CSS variables.

> [!IMPORTANT]
> The single source of truth for tokens are the JSON files in `tokens/`.
> This package uses [Style Dictionary](https://amzn.github.io/style-dictionary/) to generate platform-specific assets.
>
> ## Token Structure
>
> - **Core Tokens** (`tokens/core/`): Raw value definitions (e.g., palettes like Zinc, Red).
> - **Semantic Tokens** (`tokens/semantic/`): Functional aliases referencing core tokens (e.g., `primary`, `destructive`).
>
> Do not edit `dist/` files directly.


## Install

```bash
pnpm add @lumia/tokens
```

## Usage

```ts
import { defaultTheme, tokens, themeToCSSVars, type ThemeTokens } from '@lumia/tokens';

const cssVars = themeToCSSVars(defaultTheme);
```

Example with styled-components:

```ts
const GlobalStyles = createGlobalStyle`
  :root {
    ${Object.entries(cssVars)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n    ')}
  }
`;
```

## Token groups

- `colors`: `primary`, `secondary`, `background`, `foreground`, `border`, `muted`, `destructive`
- `typography`: `families` (`sans`, `mono`, `display`), `sizes` (`xs`–`2xl`), `weights` (`regular`, `medium`, `semibold`, `bold`)
- `radii`: `xs`, `sm`, `md`, `lg`, `pill`
- `spacing`: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- `shadows`: `xs`, `sm`, `md`, `lg`, `inset`

### Naming notes vs Figma

- Figma “Surface” → `colors.background`
- Figma “Text” → `colors.foreground`
- Figma “Error” → `colors.destructive`
