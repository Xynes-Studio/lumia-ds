# SegmentedControl (DS-804)

Inline pill-style tabs for quick filtering, built on the shadcn-style button base and keyboard roving focus.

## Exports
- `SegmentedControl`, `SegmentedControlOption`, `SegmentedControlProps` from `@lumia/components`.

## Props
- `options: { value: string; label: string; icon?: IconId }[]` — segments to render.
- `value: string` — controlled active value.
- `onChange(value: string)` — fired on click or Enter/Space from the focused pill.
- `className?: string` to style the wrapper; `buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>` applies to each pill (except `onClick`, which the component owns).

## Usage
```tsx
import { useState } from 'react';
import { SegmentedControl } from '@lumia/components';

const options = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

export function Filters() {
  const [value, setValue] = useState('all');

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={setValue}
      aria-label="Filter results"
    />
  );
}
```

## Notes
- Uses `role="radiogroup"` / `role="radio"` with roving `tabIndex` so the group is reached once via Tab. Arrow keys move focus; Enter/Space selects.
- Icons use the DS registry from `@lumia/icons` when provided.
- Compact pills align with toolbar usage; the active state uses background, border, and ring tokens consistent with tabs.
