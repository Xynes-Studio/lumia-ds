# Breadcrumbs (DS-708)

Navigation trail component for deep navigation paths.

## Exports
- `Breadcrumbs` from `@lumia-ui/components`.

## Props
- `items: { label: string; href?: string; onClick?: () => void; icon?: IconId }[]` – ordered crumbs; last item is treated as current.
- `maxItems?: number` – when set and exceeded, middle items collapse to an ellipsis while keeping the first and last visible.
- `className?: string` plus standard `HTMLAttributes<HTMLElement>` passthrough.

## Usage
```tsx
import type { IconId } from '@lumia-ui/icons';
import { Breadcrumbs } from '@lumia-ui/components';

const homeIcon = 'home' as IconId;

export function PageTrail() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/', icon: homeIcon },
        { label: 'Platform', href: '/platform' },
        { label: 'Teams', onClick: () => console.log('Teams clicked') },
        { label: 'Design System' },
      ]}
      maxItems={3}
      className="mb-4"
    />
  );
}
```

## Notes
- Renders `<nav aria-label="Breadcrumb">` with an ordered list for accessibility.
- Marks the last item with `aria-current="page"`.
- Supports interactive crumbs via `href` or `onClick`; non-interactive items render as text.
- When `maxItems` collapses items, only the first, ellipsis, and last are shown.
