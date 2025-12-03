# EmptyState (DS-709)

Reusable empty state pattern for screens with no data yet. Works within a Card or full-page container.

## Exports
- `EmptyState` and `NoResults` from `@lumia/components`.

## Props
- `title: string` – required headline.
- `description?: string` – supporting copy.
- `icon?: IconId` – optional leading icon.
- `primaryAction?: { label: string; onClick?: () => void; href?: string; icon?: IconId }`.
- `secondaryAction?: { label: string; onClick?: () => void; href?: string; icon?: IconId }`.
- `className?: string` plus standard `HTMLAttributes<HTMLDivElement>` passthrough.
- `NoResults` shares the same shape, with an additional `resetHint?: string | null` (defaults to a filter/search reset suggestion and hides when set to `null`). The `title` and `description` default to “No results found” copy tailored for filtered views.

## Usage
```tsx
import type { IconId } from '@lumia/icons';
import { Card, CardContent, EmptyState, NoResults } from '@lumia/components';

const sparkle = 'sparkle' as IconId;

export function EmptyTable() {
  return (
    <Card className="h-full">
      <CardContent className="h-full">
        <EmptyState
          icon={sparkle}
          title="No rows yet"
          description="Add your first record to populate the table."
          primaryAction={{ label: 'Add row', onClick: () => console.log('add') }}
          secondaryAction={{ label: 'Invite teammate', href: '/invite' }}
        />
      </CardContent>
    </Card>
  );
}

export function FilteredTableFallback() {
  return (
    <NoResults
      title="No results found"
      description="No rows match your current filters."
      resetHint="Clear filters or search again to see more rows."
      primaryAction={{ label: 'Reset filters', onClick: () => console.log('reset') }}
      secondaryAction={{ label: 'Edit search', onClick: () => console.log('search') }}
    />
  );
}
```

## Notes
- EmptyState is centered with generous spacing for first-time/blank-slate states; NoResults is compact with inline styling for tables and filtered lists.
- Props stay aligned across both components; NoResults defaults to “No results found” copy and includes an optional `resetHint` for filter/search guidance (set `resetHint={null}` to hide).
- Actions render as buttons by default; `href` renders as a styled link-like button while keeping the same visuals.
- Icons are optional; NoResults defaults to the `search` icon with a smaller badge so it doesn’t overpower table shells.
