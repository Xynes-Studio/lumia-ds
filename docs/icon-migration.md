# Icon Migration Guide

This guide documents the migration from direct icon library imports to the unified `@lumia/icons` system.

## Overview

The `@lumia/icons` package provides a unified icon system with:
- Automatic sprite optimization for hot-path icons
- Tree-shakable SVGR components
- Consistent size and color APIs
- Full accessibility support

## Deprecated Patterns

### Direct Lucide-React Imports

**Before (Deprecated):**
```tsx
import { Bold, Italic, Trash2 } from 'lucide-react';

<Bold className="h-4 w-4" />
<Italic className="h-4 w-4" />
<Trash2 className="h-4 w-4" />
```

**After (Recommended):**
```tsx
import { Icon } from '@lumia/icons';

<Icon name="bold" size="sm" />
<Icon name="italic" size="sm" />
<Icon name="trash" size="sm" />
```

### Legacy Component Exports

**Before (Deprecated):**
```tsx
import { IconHome, IconUser, IconBold } from '@lumia/icons';

<IconHome />
<IconUser size="lg" />
```

> [!WARNING]
> Using legacy icon components (`IconHome`, `IconBold`, etc.) will log deprecation warnings in development mode.

**After (Recommended):**
```tsx
import { Icon } from '@lumia/icons';

<Icon name="home" />
<Icon name="user" size="lg" />
```

## Migration Steps

### Step 1: Update Imports

Replace direct icon library imports with the unified `Icon` component:

```diff
-import { Bold, Italic, Link } from 'lucide-react';
+import { Icon } from '@lumia/icons';
```

### Step 2: Update Icon Usage

Replace individual icon components with the `Icon` component using the `name` prop:

```diff
-<Bold className="h-4 w-4" />
+<Icon name="bold" size="sm" />

-<Link className="h-6 w-6 text-blue-500" />
+<Icon name="link" size="md" color="primary" />
```

### Step 3: Size Mapping

The `Icon` component uses size presets that map to pixel values:

| Old Pattern | New Pattern | Size |
|-------------|-------------|------|
| `className="h-4 w-4"` | `size="sm"` | 16px |
| `className="h-6 w-6"` | `size="md"` (default) | 24px |
| `className="h-8 w-8"` | `size="lg"` | 32px |
| `className="h-12 w-12"` | `size={48}` | Custom |

### Step 4: Color Mapping

Use color presets or custom colors:

| Old Pattern | New Pattern |
|-------------|-------------|
| `className="text-foreground"` | `color="default"` |
| `className="text-muted-foreground"` | `color="muted"` |
| `className="text-primary"` | `color="primary"` |
| `className="text-destructive"` | `color="danger"` |
| `style={{ color: '#ff5500' }}` | `color="#ff5500"` |

## Available Icons

### Core Icons (from Lucide)
- `home`, `user`, `users`, `settings`, `reports`
- `add`, `edit`, `delete`, `filter`, `search`
- `check`, `alert`, `info`
- `layout-grid`, `list`, `list-ordered`
- `chevron-up`, `chevron-down`
- `bold`, `italic`, `underline`, `code`
- `link`, `trash`, `external-link`, `file-code`

### Generated Icons (from SVG)
- `chat-bubble`, `sparkle`, etc.

See the [Icon Import Workflow](./icon-import.md) for adding new icons.

## Deprecation Timeline

- **v1.x**: Legacy exports available with console warnings
- **v2.0** (planned): Legacy exports removed

## Need Help?

If you have icons not covered by the registry, you can:

1. **Add to registry**: Update `packages/icons/src/default-icons.ts`
2. **Generate from SVG**: Add to `packages/icons/svg/` and run `pnpm build:icons`
3. **Register at runtime**: Use `registerIcon(id, component)`
