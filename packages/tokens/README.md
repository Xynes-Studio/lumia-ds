# @lumia-ui/tokens

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
pnpm add @lumia-ui/tokens
```

## Usage

```ts
import { defaultTheme, tokens, type ThemeTokens } from '@lumia-ui/tokens';

// Access tokens directly
const primaryColor = tokens.colors.primary; // e.g. #18181b
```

Since tokens are already built as CSS variables in `dist/css/variables.css`, you simply need to import that CSS file in your application root:

```ts
import '@lumia-ui/tokens/dist/css/variables.css';
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
