# Tag / Chip (DS-1011)

Inline label pill for selected items and statuses, built on the shadcn badge base with Lumia tokens. Used by `MultiSelect` and any dense filter rows.

## Export
- `Tag`, `TagVariant` from `@lumia/components`.

## Props
- `label: string` – text inside the chip.
- `variant?: 'default' | 'success' | 'warning' | 'error'` – color intent, defaults to `default`.
- `onRemove?: () => void` – when provided, renders a close button with `aria-label="Remove tag <label>"`.
- `className?: string` – tailwind overrides while keeping the base pill treatment.
- Inherits all `HTMLAttributes<HTMLSpanElement>` except `children`.

## Usage
```tsx
import { Tag } from '@lumia/components';

// Static chip
<Tag label="Active" variant="success" />;

// Removable filter chip
<Tag label="Region: West" onRemove={() => handleRemove('west')} />;

// Inline next to text
<p className="text-sm text-muted-foreground">
  Owner <Tag label="Taylor" className="ml-2 align-middle" />
</p>;

// Dense wrap (e.g., filter bar)
<div className="flex flex-wrap items-center gap-1.5">
  <Tag label="Beta customers" variant="warning" onRemove={() => {}} />
  <Tag label="Trials blocked" variant="error" onRemove={() => {}} />
  <Tag label="Segment: Enterprise" className="max-w-[220px]" onRemove={() => {}} />
</div>;
```

## Notes
- Remove affordance stops event propagation so parent triggers (e.g., combobox focus) are preserved.
- Label text truncates at 160px by default to stay compact in crowded layouts; supply `className` if you need a different width.
- Focus ring and hover affordances reuse the shared shadcn button/badge tokens for consistency across the DS.
