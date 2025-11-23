# @lumia/tokens

Theme tokens exported for Lumia DS. The package ships a typed `ThemeTokens` shape and a `tokens` object consumers can import directly:

```ts
import { tokens, type ThemeTokens } from '@lumia/tokens';
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
