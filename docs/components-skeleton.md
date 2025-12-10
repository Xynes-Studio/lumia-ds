# Skeleton (DS-904)

Loading placeholder for pending content, built on the shadcn skeleton pattern.

## Export
- `Skeleton` from `@lumia-ui/components`.

## Props
- `width?: number | string` — optional width; numbers resolve to `px`, default `100%`.
- `height?: number | string` — optional height; numbers resolve to `px`, default `16px`.
- `rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'` — corner rounding, default `md`.
- `className?: string` — tailwind utility overrides; base styling is `animate-pulse bg-muted`.
- Inherits all `HTMLAttributes<HTMLDivElement>` for layout hooks and aria labels.

## Usage
```tsx
import { Skeleton } from '@lumia-ui/components';

// Inline text placeholder
<Skeleton width="40%" height={12} />;

// Stack to mimic a paragraph
<div className="space-y-2">
  <Skeleton width="32%" height={12} />
  <Skeleton width="86%" height={10} />
  <Skeleton width="90%" height={10} />
  <Skeleton width="75%" height={10} />
</div>;

// Card template with avatar + metrics
<div className="w-[360px] space-y-4 rounded-lg border border-border bg-background p-4">
  <div className="flex items-center gap-3">
    <Skeleton width={48} height={48} rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton width="60%" height={12} />
      <Skeleton width="32%" height={10} />
    </div>
  </div>
  <div className="space-y-2">
    <Skeleton height={12} />
    <Skeleton width="92%" height={12} />
    <Skeleton width="82%" height={12} />
  </div>
  <div className="grid grid-cols-3 gap-3">
    <Skeleton height={40} rounded="sm" />
    <Skeleton height={40} rounded="sm" />
    <Skeleton height={40} rounded="sm" />
  </div>
</div>;
```

## Notes
- Uses a CSS-only pulse animation to avoid layout shifts while content loads.
- Rounded variant keeps the placeholder adaptable to avatars, pills, and cards.
- `aria-hidden` defaults to `true` unless you provide `aria-label`; screen readers can skip purely decorative placeholders. 
