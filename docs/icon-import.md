# Icon Import Workflow

Convert raw SVG files into React components and register them in `@lumia/icons`.

## Steps

1. Add SVGs to `packages/icons/svg/`. File names become component names (`icon-check.svg` → `IconCheck`).
2. Run the generator:
   ```bash
   pnpm build:icons
   ```
   This runs SVGR to generate React components under `packages/icons/src/generated/`.
3. Generated exports live in `packages/icons/src/generated/index.ts`, and registration happens in `packages/icons/src/generated/registry.ts`. These files are auto-written—do not edit by hand.

## Unified Icon Component (Recommended)

The `<Icon>` component provides a single API for all icons, automatically choosing the optimal rendering path (sprite vs SVGR).

```tsx
import { Icon } from '@lumia/icons';

// Basic usage
<Icon name="info" />

// With size preset (sm=16px, md=24px, lg=32px)
<Icon name="check" size="lg" />

// With custom size
<Icon name="search" size={48} />

// With color preset
<Icon name="alert" color="danger" />

// With custom color
<Icon name="info" color="#ff5500" />

// With accessible title
<Icon name="warning" title="Warning message" />
```

### Icon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Icon name from registry |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Size preset or pixel value |
| `color` | `'default' \| 'muted' \| 'primary' \| 'danger' \| string` | `'default'` | Color preset or CSS value |
| `title` | `string` | — | Accessible title for screen readers |
| `className` | `string` | — | Additional CSS classes |

### Size Presets

- `sm` = 16px
- `md` = 24px (default)
- `lg` = 32px

### Color Presets

- `default` → `text-foreground`
- `muted` → `text-muted-foreground`
- `primary` → `text-primary`
- `danger` → `text-destructive`

## Direct Import (Tree-Shakable)

For generated icons, you can also import components directly:

```tsx
import { IconCheck, IconSparkle } from '@lumia/icons';

<IconCheck className="text-green-500" />;
```

## SVG Sprite Setup

For hot-path icons, the unified `<Icon>` automatically uses the sprite. Add `<IconSprite />` once at your app root:

```tsx
import { IconSprite } from '@lumia/icons';

function App() {
  return (
    <>
      <IconSprite />
      <YourRoutes />
    </>
  );
}
```

### Sprite Icons

`chevron-down`, `chevron-up`, `check`, `add`, `edit`, `delete`, `info`, `alert`, `search`

These icons are automatically rendered via `<use href>` for better performance.

## Notes

- SVGO optimizes SVGs (e.g., converts `polyline` to `path`).
- JSX props are camelCased automatically.
- `sideEffects: false` in `package.json` enables tree-shaking.
- Registries reset when the icons package loads, seeding curated Lucide icons plus generated icons.
- Adding a new icon to the registry automatically exposes it via `<Icon name="..." />`.

## Accessibility (a11y)

Icons must be marked as either **decorative** or **informative** for screen readers.

### Decorative Icons

Used purely for visual enhancement, hidden from assistive technologies:

```tsx
<Icon name="check" />
// Output: <svg aria-hidden="true" focusable="false" />
```

### Informative Icons

Convey meaning and require accessible labels:

```tsx
<Icon name="alert" title="Warning: Action required" />
// Output: <svg role="img" aria-labelledby="icon-title-alert">
//           <title id="icon-title-alert">Warning: Action required</title>
```

### SpriteIcon Accessibility

Same pattern applies to `SpriteIcon`:

```tsx
// Decorative (default)
<SpriteIcon name="chevron-down" />

// Informative
<SpriteIcon name="alert" title="Warning" />
```

### Best Practices

| Scenario | Usage |
|----------|-------|
| Icon next to text label | Decorative (no `title`) |
| Icon-only button | Informative (`title` required) |
| Status indicators | Informative (`title` with status meaning) |
| Decorative flourishes | Decorative (no `title`) |

