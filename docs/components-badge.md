# Badge (DS-1101)

Small pill for inline labels or counts, built on the shadcn badge base with Lumia background/border/foreground tokens.

## Export
- `Badge`, `BadgeVariant` from `@lumia/components`.

## Props
- `children: React.ReactNode` – badge text/content.
- `variant?: 'default' | 'outline' | 'subtle'` – visual treatment, defaults to `default`.
- `className?: string` – tailwind overrides while keeping the base pill styling.
- Inherits all `HTMLAttributes<HTMLSpanElement>`.

## Usage
```tsx
import { Badge } from '@lumia/components';

<Badge>New</Badge>;
<Badge variant="outline">Draft</Badge>;
<Badge variant="subtle" className="uppercase tracking-wide">Beta</Badge>;
```

## Notes
- Default badge uses the primary color on Lumia background tokens; outline/subtle rely on `border`/`muted` tokens for contrast.
- Focus ring mirrors other shadcn-based controls to stay consistent across the DS.
