# @lumia/tokens

Theme tokens exported for Lumia DS. The package ships a typed `ThemeTokens` shape and a `defaultTheme` object consumers can import directly:

```ts
import { defaultTheme, tokens, type ThemeTokens } from '@lumia/tokens';
```

`themeToCSSVars` maps any `ThemeTokens` object into a CSS variable record you can drop into styled-components, CSS-in-JS, or Tailwind config.

```ts
import { defaultTheme, themeToCSSVars } from '@lumia/tokens';

const cssVars = themeToCSSVars(defaultTheme);

// example in styled-components
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
- Figma “Error” → `colors.destructive` (aligns with component prop naming)
