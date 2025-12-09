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

## Use the Icons

### Direct Import (Tree-Shakable)

```tsx
import { IconCheck, IconSparkle } from '@lumia/icons';

<IconCheck className="text-green-500" />;
```

### Via Icon Registry

```tsx
import { Icon } from '@lumia/icons';

<Icon id="icon-check" size={24} className="text-primary-600" />;
```

## Notes

- SVGO optimizes SVGs (e.g., converts `polyline` to `path`).
- JSX props are camelCased automatically.
- `sideEffects: false` in `package.json` enables tree-shaking.
- Registries reset when the icons package loads, seeding curated Lucide icons plus generated icons.

