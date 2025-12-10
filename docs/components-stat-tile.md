# StatTile (@lumia-ui/components)

Compact KPI tile for dashboards and summary grids. Presents a label, primary metric, optional directional delta, and optional icon.

## Import
```ts
import { StatTile, type StatTileProps, type StatTileDelta } from '@lumia-ui/components';
```

## Props
- `label: string` — small title displayed above the metric.
- `value: string | number` — primary metric text, rendered large.
- `delta?: { value: number; direction: 'up' | 'down' }` — optional change badge with arrow and semantic colour (green up, red down).
- `icon?: IconId` — optional decorative icon aligned to the right.
- `className?: string` — extends the Card wrapper.

## Behavior
- Built on the `Card` primitive for consistent padding, border, and hover behavior.
- Delta pill shows a chevron (up/down), prefixes “+” for up and “-” for down, and uses success/error tones.
- Layout stays compact in grids; padding adjusts at the `sm` breakpoint.
- Label and value wrap in a flex row with space for the optional icon; text uses `min-w-0` to avoid overflow.

## Examples
### Dashboard grid
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatTile
    label="Monthly revenue"
    value="$128k"
    delta={{ value: 12.4, direction: 'up' }}
    icon="reports"
  />
  <StatTile
    label="New signups"
    value="3,482"
    delta={{ value: 3.1, direction: 'up' }}
    icon="users"
  />
  <StatTile
    label="Churn rate"
    value="4.3%"
    delta={{ value: 0.8, direction: 'down' }}
    icon="alert"
  />
</div>
```

### Minimal metric
```tsx
<StatTile label="Open tickets" value="17" />
```

## Accessibility notes
- Purely presentational content; no interactive focus targets.
- Icons are marked `aria-hidden`; metric and delta are exposed as text.
- Use surrounding headings/landmarks to provide context within dashboards.
