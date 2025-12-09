# @lumia/icons

Icon registry utilities and the unified `<Icon>` React component for Lumia DS.

## Install

```bash
pnpm add @lumia/icons
```

## Unified Icon Component

The `<Icon>` component provides a single API for all icons:

```tsx
import { Icon, IconSprite } from '@lumia/icons';

// Add sprite once at app root
function App() {
  return (
    <>
      <IconSprite />
      <YourRoutes />
    </>
  );
}

// Use anywhere
<Icon name="info" />
<Icon name="check" size="lg" color="primary" />
<Icon name="alert" color="danger" title="Warning" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Icon name from registry |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Size preset or pixels |
| `color` | `'default' \| 'muted' \| 'primary' \| 'danger' \| string` | `'default'` | Color preset or CSS |
| `title` | `string` | — | Accessible title |

### Size Presets

- `sm` = 16px
- `md` = 24px (default)
- `lg` = 32px

### Color Presets

- `default` → text-foreground
- `muted` → text-muted-foreground
- `primary` → text-primary
- `danger` → text-destructive

### Accessibility

Icons support both decorative and informative semantics:

**Decorative icons** (default) are hidden from screen readers:
```tsx
<Icon name="check" />
// Output: <svg aria-hidden="true" focusable="false" />
```

**Informative icons** convey meaning via the `title` prop:
```tsx
<Icon name="alert" title="Warning: Action required" />
// Output: <svg role="img" aria-labelledby="icon-title-alert"><title>...</title>
```

Same pattern works for `SpriteIcon`:
```tsx
<SpriteIcon name="info" title="More information" />
```

## Available Icons

**Curated Lucide icons:** `home`, `user`, `users`, `settings`, `reports`, `add`, `edit`, `delete`, `filter`, `search`, `check`, `alert`, `info`

**Custom icons:** `sparkle`, `chat-bubble`

**Sprite icons (hot-path):** `chevron-down`, `chevron-up`, `check`, `add`, `edit`, `delete`, `info`, `alert`, `search`

## Registering Custom Icons

```tsx
import { registerIcon } from '@lumia/icons';

const CustomBell = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 2a7 7 0 00-7 7v3l-1.5 2H20.5L19 12V9a7 7 0 00-7-7Z" />
  </svg>
);

registerIcon('bell', CustomBell);
// Now use: <Icon name="bell" />
```

## Building Icons from SVG

Add SVG files to `packages/icons/svg/` and run:

```bash
pnpm build:icons
```

Generated components are exported from `@lumia/icons` and auto-registered.

## Direct Import (Tree-Shakable)

```tsx
import { IconCheck, IconSparkle } from '@lumia/icons';

<IconCheck className="text-green-500" />
```
