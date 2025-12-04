# Toolbar / FlexRow (DS-1201)

Flexible horizontal layout helper for aligning form controls and actions, stacking vertically on narrow viewports. Built on the shadcn-style flex wrappers used across the DS.

## Exports
- `Toolbar`, `ToolbarProps` from `@lumia/components`.

## Props
- `align?: 'start' | 'center' | 'end'` – cross-axis alignment for both groups. Defaults to `center`.
- `gap?: 'sm' | 'md' | 'lg'` – spacing token between items and between the two groups. Defaults to `md`.
- `left?: ReactNode` – optional left-aligned group. If omitted, `children` render here.
- `right?: ReactNode` – optional right-aligned group, aligned to the end on wider screens.
- `className?: string` and native `HTMLDivElement` props pass through to the wrapper.

## Usage
```tsx
import { Toolbar, Button, Input, SegmentedControl } from '@lumia/components';

export function Filters() {
  return (
    <Toolbar
      gap="md"
      align="center"
      className="rounded-lg border border-border bg-background p-4"
      left={
        <>
          <Input
            placeholder="Search items"
            className="min-w-[200px] sm:min-w-[260px]"
          />
          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
            value="all"
            onChange={() => {}}
          />
        </>
      }
      right={
        <>
          <Button size="sm" variant="ghost">
            Reset
          </Button>
          <Button size="sm">Create</Button>
        </>
      }
    />
  );
}
```

## Notes
- Recommended structure: a left-aligned control cluster and a right-aligned action cluster.
- Responsive: stacks into a single column on very small screens, with both groups wrapping their contents.
- Uses shadcn-derived spacing and focus tokens, matching other layout wrappers like `Flex`.
